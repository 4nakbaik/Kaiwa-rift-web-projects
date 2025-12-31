#  KAIWA RIFT (会話リフト)

**"浪人の日本の達人への道"**
*The Ronin's Path to Japanese Mastery*

Kaiwa Rift adalah platform pembelajaran Bahasa Jepang khususnya entry level(N5-N4) yg interaktif dengan menggabungkan metode ilmiah **Spaced Repetition System (SRS)** dengan art yg terinspirasi dari **Era Sengoku**. Dibangun dengan arsitektur *Microservices* modern untuk performa dan skalabilitas yg tinggi.

---

## Tech Stack

* **Frontend:** React(Vite), Tailwind CSS, Framer Motion(Animations).
* **Backend:** Go + Gin Framework, GORM.
* **Machine Learning:** Python, NumPy(Ebbinghaus Algorithm).
* **Database:** PostgreSQL.
* **Infrastructure:** Docker.

---

## Fitur 

### 1. Nyumon (The Gate) - Authentication
Gerbang masuk bagi para Ronin Sejati. Desain formulir menyerupai gulungan kertas washi kuno dengan validasi yang aman menggunakan JWT.

> **<img width="1870" height="915" alt="Screenshot 2025-12-31 202508" src="https://github.com/user-attachments/assets/ae9ffca0-e994-40bc-a716-53e3e542a9a4" />**
> **<img width="1870" height="915" alt="Screenshot 2025-12-31 202532" src="https://github.com/user-attachments/assets/64791a03-9ebf-4bb2-aff3-f49f041e764a" />**


> *Formulir pendaftaran dengan gaya emakimono jepun.*

### 2. Dojo (Dashboard)
Pusat latihan.
* **Ink Path:** Visualisasi progres mastery bahasa jepun yg terisi secara otomatis.
* **Shouma-sensei:** Model ML yang memberikan nasihat belajar berdasarkan data retensi memori user.
* **Navigation:** Menu navigasi yang menunjukkan arah bertarung(belajar ye maksudnya).

> **<img width="1858" height="903" alt="Dashboard" src="https://github.com/user-attachments/assets/041444c8-e063-4eb5-8a9a-eff9314379a2" />**

> *Tampilan utama dengan style khas sengoku era dan prediksi AI.*

### 3. Anki (Memorization) - Flashcards
Modul hafalan inti menggunakan sistem SRS.
* **Ofuda Cards:** Kartu didesain menyerupai jimat kertas kepercayaan shinto jepang .
* **Hanko Buttons:** Tombol evaluasi(Lupa/Ragu/Ingat).

> **<img width="1870" height="902" alt="flashcard-dboard" src="https://github.com/user-attachments/assets/f2c5fd1a-affb-4568-a66d-2bcf6c74641b" />**
> **<img width="400" height="671" alt="front" src="https://github.com/user-attachments/assets/571dcafb-e8f7-4dcd-9f4f-fd9d213b51d4" />**
> **<img width="400" height="671" alt="back" src="https://github.com/user-attachments/assets/178eba8a-e61c-440b-aad6-65a67200dd1c" />**

> *Tampilan kartu bagian depan (Kanji) dan belakang (Arti).*

### 4. Shiren (The Trial) - Examination
Ujian sekelas nasional untuk memvalidasi hafalan.
* **Gatekeeping System:** Ujian terkunci jika user belum menghafal minimal 25 kotoba.
* **Dynamic Quota:** Soal diambil secara statistik (80% dari kotoba yang sudah dikuasai, misal jika user berhasil hafal 50 kotoba dari anki/kartu maka 50-80%=40, jadi dari 40 kotoba itulah yang akan keluar di trial nanti ).
* **Incense Timer:** Penunjuk waktu visual berupa batang dupa yang terbakar habis.

> **<img width="1866" height="907" alt="exam" src="https://github.com/user-attachments/assets/c2009aff-f611-4f87-897d-c7fd10551792" />**

> *Tampilan ujian dengan timer dan input-an dari user.*

### 5. Mibun no Makimono - User Identity
Menu profil yg interaktif dalam bentuk gulungan kuno khas jepun sengoku era.
* **Graph:** Grafik performa memori 7 hari ke depan.
* **Kaimei:** Fitur penggantian username.

> **<img width="540" height="550" alt="Screenshot 2025-12-31 020624" src="https://github.com/user-attachments/assets/141d9d1f-c411-446b-bb21-1e3402d0da75" />**
> **<img width="540" height="550" alt="Screenshot 2025-12-31 020652" src="https://github.com/user-attachments/assets/c9e295f2-14f9-47d9-9f93-255e3e4a4d54" />**

> *profil user dengan grafik retensi memori.*

---

## Machine Learning 

Web ini bukan hanya mencatat skor saja, tetapi juga "berpikir".
* **Algoritma:** Menggunakan serapan algorithm dari *Ebbinghaus Forgetting Curve*.
* **Fungsi:** Memprediksi kapan user akan melupakan sebuah kata dan menyarankan waktu untuk review yang tepat.
* **Logarithmic Stability:** Perhitungan stabilitas memori jangka panjang yang akurat.

> **<img width="934" height="579" alt="Screenshot 2025-12-31 014510" src="https://github.com/user-attachments/assets/ba516d47-79e8-4204-88a2-ba808d0483e8" />**

> *contoh hasil grafik visualisasi dari projek web ini.*


---

## Instruksi install

Siapkan Docker Desktop dan pastikan sudah berjalan.

```bash
# 1. Clone repository
git clone https://github.com/4nakbaik/Kaiwa-rift-web-projects.git

# 2. Build & Run Container
docker-compose up --build
