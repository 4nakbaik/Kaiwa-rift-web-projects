package handlers

import (
	"kotoba-backend/internal/database"
	"kotoba-backend/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// SeedDatabase: Fungsi untuk mengisi data scr manual
func SeedDatabase(c *gin.Context) {
	// 1. Data Hardcoded
	vocabList := []models.Vocabulary{
		{Kanji: "私", Kana: "わたし", Romaji: "watashi", Meaning: "Saya", ExampleSentence: "私は学生です (Saya adalah murid)", DifficultyLevel: 1},
		{Kanji: "あなた", Kana: "あなた", Romaji: "anata", Meaning: "Anda/Kamu", ExampleSentence: "あなたは誰ですか (Siapa Anda?)", DifficultyLevel: 1},
		{Kanji: "先生", Kana: "せんせい", Romaji: "sensei", Meaning: "Guru", ExampleSentence: "先生、質問があります", DifficultyLevel: 1},
		{Kanji: "学生", Kana: "がくせい", Romaji: "gakusei", Meaning: "Siswa", ExampleSentence: "彼は大学の学生です", DifficultyLevel: 1},
		{Kanji: "猫", Kana: "ねこ", Romaji: "neko", Meaning: "Kucing", ExampleSentence: "猫が好きです", DifficultyLevel: 1},
		{Kanji: "犬", Kana: "いぬ", Romaji: "inu", Meaning: "Anjing", ExampleSentence: "犬が走っています", DifficultyLevel: 1},
		{Kanji: "食べる", Kana: "たべる", Romaji: "taberu", Meaning: "Makan", ExampleSentence: "ご飯を食べる", DifficultyLevel: 1},
		{Kanji: "見る", Kana: "みる", Romaji: "miru", Meaning: "Melihat", ExampleSentence: "テレビを見る", DifficultyLevel: 1},
		{Kanji: "本", Kana: "ほん", Romaji: "hon", Meaning: "Buku", ExampleSentence: "本を読みます", DifficultyLevel: 1},
		{Kanji: "日本", Kana: "にほん", Romaji: "nihon", Meaning: "Jepang", ExampleSentence: "日本に行きたい", DifficultyLevel: 1},
	}

	// 2. Cek apakah udah ada data?
	var count int64
	database.DB.Model(&models.Vocabulary{}).Count(&count)
	if count > 0 {
		c.JSON(http.StatusOK, gin.H{"message": "Database sudah ada isinya, skip seeding.", "total": count})
		return
	}

	// 3. Masukkan Data
	result := database.DB.Create(&vocabList)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal inject data: " + result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "SUKSES! 10 Data Berhasil Ditanam.", "data": vocabList})
}
