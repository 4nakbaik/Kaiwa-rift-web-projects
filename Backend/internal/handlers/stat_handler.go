package handlers

import (
	"kotoba-backend/internal/database"
	"net/http"

	"github.com/gin-gonic/gin"
)

type UserStats struct {
	TotalLearned int     `json:"total_learned"`
	IngatCount   int     `json:"ingat_count"` // Result = 2
	RaguCount    int     `json:"ragu_count"`  // Result = 1
	LupaCount    int     `json:"lupa_count"`  // Result = 0
	N5Mastery    float64 `json:"n5_mastery"`  // Persentase
	IsUnlockedN4 bool    `json:"is_unlocked_n4"`
}

func GetUserStats(c *gin.Context) {
	userID := getUserID(c) // Helper yang kita buat sebelumnya

	var stats UserStats

	// 1. Hitung Log User (Group by Result)
	// Kita hitung status TERAKHIR user untuk setiap kata
	// (Query CTE ini memastikan kita hanya mengambil log terbaru per kata)
	query := `
		WITH LatestLogs AS (
			SELECT vocab_id, result,
				ROW_NUMBER() OVER (PARTITION BY vocab_id ORDER BY reviewed_at DESC) as rn
			FROM review_logs 
			WHERE user_id = ?
		)
		SELECT 
			COUNT(*) as total_learned,
			COUNT(CASE WHEN result = 2 THEN 1 END) as ingat_count,
			COUNT(CASE WHEN result = 1 THEN 1 END) as ragu_count,
			COUNT(CASE WHEN result = 0 THEN 1 END) as lupa_count
		FROM LatestLogs 
		WHERE rn = 1;
	`
	database.DB.Raw(query, userID).Scan(&stats)

	// 2. Hitung Mastery N5
	// Asumsi: Total N5 standar ada sekitar 100 kata (atau ambil count real dari DB)
	var totalN5 int64
	database.DB.Table("vocabularies").Where("difficulty_level = 1").Count(&totalN5)

	if totalN5 > 0 {
		stats.N5Mastery = (float64(stats.IngatCount) / float64(totalN5)) * 100
	} else {
		stats.N5Mastery = 0
	}

	// 3. Cek Syarat Unlock (90%)
	if stats.N5Mastery >= 90.0 {
		stats.IsUnlockedN4 = true
	} else {
		stats.IsUnlockedN4 = false
	}

	c.JSON(http.StatusOK, stats)
}
