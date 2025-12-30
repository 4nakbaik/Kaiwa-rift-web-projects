package handlers

import (
	"kotoba-backend/internal/database"
	"kotoba-backend/internal/middleware"
	"kotoba-backend/internal/models"
	"net/http"
	"strings" // Import ini penting untuk cek spasi

	"github.com/gin-gonic/gin"
)

func Register(c *gin.Context) {
	var body struct {
		Username string
		Email    string
		Password string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	// --- VALIDASI TAMBAHAN ---
	// 1. Cek kosong / spasi doang
	if strings.TrimSpace(body.Username) == "" || strings.TrimSpace(body.Email) == "" || strings.TrimSpace(body.Password) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username, Email, dan Password tidak boleh kosong!"})
		return
	}

	// 2. Cek panjang password (Opsional, standar keamanan)
	if len(body.Password) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password minimal 6 karakter!"})
		return
	}
	// -------------------------

	hash, _ := middleware.HashPassword(body.Password)
	user := models.User{Username: body.Username, Email: body.Email, Password: hash}

	result := database.DB.Create(&user)
	if result.Error != nil {
		// Cek apakah error karena duplikat (username/email sudah dipakai)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username atau Email sudah terdaftar!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registrasi Berhasil! Silakan Login."})
}

// ... Fungsi Login biarkan seperti sebelumnya ...
func Login(c *gin.Context) {
	// ... code login yang lama ...
	var body struct {
		Email    string
		Password string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body"})
		return
	}

	var user models.User
	database.DB.First(&user, "email = ?", body.Email)

	if user.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email atau Password salah"})
		return
	}

	if !middleware.CheckPasswordHash(body.Password, user.Password) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email atau Password salah"})
		return
	}

	token, _ := middleware.GenerateToken(user.ID)
	// Kita kirim balik username juga agar frontend bisa menyapa user
	c.JSON(http.StatusOK, gin.H{
		"token":    token,
		"username": user.Username,
	})
}
