package models

type Vocabulary struct {
	ID              uint   `gorm:"primaryKey" json:"id"`
	Kanji           string `gorm:"column:kanji" json:"kanji"`
	Kana            string `gorm:"column:kana" json:"kana"`
	Romaji          string `gorm:"column:romaji" json:"romaji"`
	Meaning         string `gorm:"column:meaning" json:"meaning"`
	ExampleSentence string `gorm:"column:example_sentence" json:"example_sentence"`
	DifficultyLevel int    `gorm:"column:difficulty_level" json:"difficulty_level"`
}

func (Vocabulary) TableName() string {
	return "vocabularies"
}
