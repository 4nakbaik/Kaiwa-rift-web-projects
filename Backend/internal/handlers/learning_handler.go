package handlers

import (
	"kotoba-backend/internal/database"
	"kotoba-backend/internal/models"
	"net/http"
	"time"

	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Helper: Ambil UserID dari Token
func getUserID(c *gin.Context) uint {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return 0
	}
	// Format "Bearer <token>"
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	token, _ := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Pastikan parsing float64 ke uint aman
		if val, ok := claims["sub"].(float64); ok {
			return uint(val)
		}
	}
	return 0
}

// 1. GET FLASHCARDS (VERSI STABIL / SIMPEL)
func GetFlashcards(c *gin.Context) {
	userID := getUserID(c)

	// 1. Cek Mastery Rate User
	var mastery float64
	database.DB.Raw(`
		SELECT (COUNT(DISTINCT vocab_id) FILTER (WHERE result = 2))::float / 100 * 100 
		FROM review_logs WHERE user_id = ?`, userID).Scan(&mastery)

	var vocabs []models.Vocabulary

	if mastery >= 90 {
		// MODE MIX: Ambil N4 dan N5 yang sering Lupa/Ragu
		database.DB.Raw(`
			SELECT v.* FROM vocabularies v
			LEFT JOIN review_logs r ON v.id = r.vocab_id AND r.user_id = ?
			WHERE v.difficulty_level IN (1, 2) 
			ORDER BY r.result ASC NULLS FIRST, RANDOM() LIMIT 10`, userID).Scan(&vocabs)
	} else {
		// MODE FOKUS N5: Prioritas yang belum hafal
		database.DB.Raw(`
			SELECT v.* FROM vocabularies v
			LEFT JOIN review_logs r ON v.id = r.vocab_id AND r.user_id = ?
			WHERE v.difficulty_level = 1
			ORDER BY r.result ASC NULLS FIRST, RANDOM() LIMIT 10`, userID).Scan(&vocabs)
	}

	c.JSON(http.StatusOK, gin.H{"data": vocabs, "mastery_mode": mastery >= 90})
}

// 2. SUBMIT REVIEW (Simpan Hasil Belajar)
func SubmitReview(c *gin.Context) {
	userID := getUserID(c)
	var body struct {
		VocabID uint `json:"vocab_id"`
		Result  int  `json:"result"` // 0, 1, 2
	}

	if c.BindJSON(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data invalid"})
		return
	}

	// Simpan Log
	log := models.ReviewLog{
		UserID:     userID,
		VocabID:    body.VocabID,
		Result:     body.Result,
		ReviewedAt: time.Now(),
	}

	database.DB.Create(&log)

	c.JSON(http.StatusOK, gin.H{"message": "Progress disimpan", "exp_gained": 10})
}
