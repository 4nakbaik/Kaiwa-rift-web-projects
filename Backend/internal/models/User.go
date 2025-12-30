package models

import (
	"time"
)

type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Username  string         `gorm:"unique;not null" json:"username"`
	Email     string         `gorm:"unique;not null" json:"email"`
	Password  string         `json:"-"`
	Role      string         `json:"role" gorm:"default:'user'"`
	CreatedAt time.Time      `json:"created_at"`
	Progress  []UserProgress `json:"progress,omitempty"`
}

type ReviewLog struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `json:"user_id"`
	VocabID    uint      `json:"vocab_id"`
	Result     int       `json:"result"` // 0: Lupa, 1: Ragu, 2: Ingat
	ReviewedAt time.Time `json:"reviewed_at" gorm:"default:CURRENT_TIMESTAMP"`
}

type UserProgress struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	VocabID   uint      `json:"vocab_id"`
	Status    string    `json:"status"`
	Level     string    `json:"level"`
	UpdatedAt time.Time `json:"updated_at"`
}
