package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// --- CONFIGURATION ---

var (
	db        *gorm.DB
	jwtSecret = []byte(os.Getenv("JWT_SECRET"))

	mlServiceURL = "http://ml_service:5000/predict_retention"

	httpClient = &http.Client{
		Timeout: 5 * time.Second,
	}
)

// --- DATABASE MODELS ---
type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Username  string         `gorm:"unique;not null" json:"username"`
	Email     string         `gorm:"unique;not null" json:"email"`
	Password  string         `gorm:"not null" json:"-"`
	Role      string         `gorm:"default:'user'" json:"role"`
	Avatar    string         `json:"avatar" gorm:"default:'default'"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Vocabulary struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	Kanji           string         `json:"kanji"`
	Kana            string         `gorm:"not null" json:"kana"`
	Romaji          string         `gorm:"not null" json:"romaji"`
	Meaning         string         `gorm:"not null" json:"meaning"`
	ExampleSentence string         `json:"example_sentence"`
	DifficultyLevel int            `gorm:"default:1" json:"difficulty_level"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Vocabulary) TableName() string { return "vocabularies" }

type ReviewLog struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `json:"user_id"`
	VocabID    uint      `json:"vocab_id"`
	Result     int       `json:"result"` // 0: Lupa, 1: Ragu, 2: Ingat
	ReviewedAt time.Time `gorm:"autoCreateTime" json:"reviewed_at"`
}

func (ReviewLog) TableName() string { return "review_logs" }

type UserStatsDTO struct {
	TotalLearned int `json:"total_learned"`
	IngatCount   int `json:"ingat_count"`
	RaguCount    int `json:"ragu_count"`
	LupaCount    int `json:"lupa_count"`
}

type MLResponse struct {
	RetentionRate   float64   `json:"retention_rate"`
	Status          string    `json:"status"`
	DecayRisk       string    `json:"decay_risk"`
	NextReviewHours float64   `json:"next_review_hours"`
	GraphData       []float64 `json:"graph_data"`
}

// --- DATABASE INIT ---

func initDB() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	var err error
	maxRetries := 15

	for i := 0; i < maxRetries; i++ {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			log.Println("[INFO] Database connection established")
			break
		}
		log.Printf("[INFO] Connecting to DB... (%d/%d)", i+1, maxRetries)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatalf("[FATAL] DB Connection failed: %v", err)
	}

	db.AutoMigrate(&User{}, &ReviewLog{}, &Vocabulary{})
	log.Println("[INFO] Migration completed")
}

// --- MIDDLEWARE ---

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Set("user_id", uint(claims["user_id"].(float64)))
		}
		c.Next()
	}
}

// --- CORE LOGIC ---

func getUserStats(userID uint) (UserStatsDTO, error) {
	var results []struct {
		Result int
	}

	// Query Ambil status TERAKHIR user
	err := db.Raw(`
		SELECT result 
		FROM (
			SELECT DISTINCT ON (vocab_id) result, vocab_id
			FROM review_logs 
			WHERE user_id = ? 
			ORDER BY vocab_id, reviewed_at DESC
		) as latest_reviews
	`, userID).Scan(&results).Error

	if err != nil {
		return UserStatsDTO{}, err
	}

	stats := UserStatsDTO{
		TotalLearned: len(results),
	}

	for _, r := range results {
		switch r.Result {
		case 2:
			stats.IngatCount++
		case 1:
			stats.RaguCount++
		case 0:
			stats.LupaCount++
		}
	}

	return stats, nil
}

// --- HANDLERS ---

func Register(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	user := User{Username: input.Username, Email: input.Email, Password: string(hashedPassword)}

	if result := db.Create(&user); result.Error != nil {
		if strings.Contains(result.Error.Error(), "duplicate key") {
			c.JSON(http.StatusConflict, gin.H{"error": "Username/Email already exists"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
		}
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Registration successful"})
}

func Login(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var user User
	if err := db.Where("username = ? OR email = ?", input.Username, input.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString(jwtSecret)

	c.JSON(http.StatusOK, gin.H{"token": tokenString, "username": user.Username})
}

// Endpoint Profil Baru (update profil)
func UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var input struct {
		Username string `json:"username"`
		Avatar   string `json:"avatar"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input invalid"})
		return
	}

	var user User
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if input.Username != "" && input.Username != user.Username {
		var check User
		if err := db.Where("username = ?", input.Username).First(&check).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Username taken"})
			return
		}
		user.Username = input.Username
	}

	if input.Avatar != "" {
		user.Avatar = input.Avatar
	}

	db.Save(&user)
	c.JSON(http.StatusOK, gin.H{
		"message":  "Profile updated",
		"username": user.Username,
		"avatar":   user.Avatar,
	})
}

func GetVocabularies(c *gin.Context) {
	var vocabs []Vocabulary
	if result := db.Order("RANDOM()").Limit(50).Find(&vocabs); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": vocabs})
}

func SubmitReview(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var input struct {
		VocabID uint `json:"vocab_id" binding:"required"`
		Result  int  `json:"result" binding:"gte=0,lte=2"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	review := ReviewLog{
		UserID:     userID.(uint),
		VocabID:    input.VocabID,
		Result:     input.Result,
		ReviewedAt: time.Now(),
	}

	if err := db.Create(&review).Error; err != nil {
		log.Printf("[ERROR] Save log failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Saved"})
}

func GetStats(c *gin.Context) {
	userID, _ := c.Get("user_id")

	stats, err := getUserStats(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB Error"})
		return
	}

	var totalVocabs int64
	db.Model(&Vocabulary{}).Count(&totalVocabs)
	mastery := 0.0
	if totalVocabs > 0 {
		mastery = (float64(stats.IngatCount) / float64(totalVocabs)) * 100
	}

	// Call ML
	var mlData MLResponse
	reqBody, _ := json.Marshal(map[string]int{
		"total_learned": stats.TotalLearned,
		"ingat_count":   stats.IngatCount,
		"ragu_count":    stats.RaguCount,
		"lupa_count":    stats.LupaCount,
	})

	resp, err := httpClient.Post(mlServiceURL, "application/json", bytes.NewBuffer(reqBody))
	if err == nil && resp.StatusCode == 200 {
		defer resp.Body.Close()
		json.NewDecoder(resp.Body).Decode(&mlData)
	} else {
		mlData = MLResponse{
			RetentionRate: 100, Status: "OFFLINE", DecayRisk: "UNKNOWN", NextReviewHours: 0,
			GraphData: []float64{0, 0, 0, 0, 0, 0, 0},
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"total_learned":     stats.TotalLearned,
		"ingat_count":       stats.IngatCount,
		"ragu_count":        stats.RaguCount,
		"lupa_count":        stats.LupaCount,
		"n5_mastery":        mastery,
		"is_unlocked_n4":    mastery > 90,
		"retention_rate":    mlData.RetentionRate,
		"ml_status":         mlData.Status,
		"decay_risk":        mlData.DecayRisk,
		"next_review_hours": mlData.NextReviewHours,
		"graph_data":        mlData.GraphData,
	})
}

func GetExamQuestions(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var masteredIDs []uint
	err := db.Raw(`
		SELECT vocab_id FROM (
			SELECT DISTINCT ON (vocab_id) vocab_id, result
			FROM review_logs 
			WHERE user_id = ? 
			ORDER BY vocab_id, reviewed_at DESC
		) as latest WHERE result = 2
	`, userID).Scan(&masteredIDs).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB Error"})
		return
	}

	masteredCount := len(masteredIDs)
	const MIN_REQ = 25

	if masteredCount < MIN_REQ {
		c.JSON(http.StatusForbidden, gin.H{
			"error":    "LOCKED",
			"message":  fmt.Sprintf("Need %d words. You have %d.", MIN_REQ, masteredCount),
			"current":  masteredCount,
			"required": MIN_REQ,
		})
		return
	}

	examSize := int(float64(masteredCount) * 0.8)
	if examSize < 10 {
		examSize = 10
	}

	var questions []Vocabulary
	if err := db.Where("id IN (?)", masteredIDs).Order("RANDOM()").Limit(examSize).Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate exam"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":           questions,
		"total_mastered": masteredCount,
		"exam_size":      examSize,
	})
}

// --- MAIN ENTRYPOINT ---

func main() {
	if len(jwtSecret) == 0 {
		log.Println("[WARN] JWT_SECRET missing")
	}

	initDB()

	r := gin.Default()
	r.Use(CORSMiddleware())
	r.POST("/register", Register)
	r.POST("/login", Login)

	auth := r.Group("/api")
	auth.Use(AuthMiddleware())
	{
		auth.GET("/flashcards", GetVocabularies)
		auth.GET("/stats", GetStats)
		auth.POST("/review", SubmitReview)
		auth.GET("/exam-questions", GetExamQuestions)
		auth.PUT("/profile", UpdateProfile)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("[INFO] Server running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("[FATAL] Server failed: %v", err)
	}
}
