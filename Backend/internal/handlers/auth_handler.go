package handlers

import (
	"kotoba-backend/internal/database"
	"kotoba-backend/internal/middleware"
	"kotoba-backend/internal/models"
	"net/http"
	"strings"

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

	if strings.TrimSpace(body.Username) == "" || strings.TrimSpace(body.Email) == "" || strings.TrimSpace(body.Password) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username, Email, dan Password tidak boleh kosong!"})
		return
	}

	if len(body.Password) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password minimal 6 karakter!"})
		return
	}

	hash, _ := middleware.HashPassword(body.Password)
	user := models.User{Username: body.Username, Email: body.Email, Password: hash}

	result := database.DB.Create(&user)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username atau Email sudah terdaftar!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registrasi Berhasil! Silakan Login."})
}

func Login(c *gin.Context) {
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
	c.JSON(http.StatusOK, gin.H{
		"token":    token,
		"username": user.Username,
	})
}
