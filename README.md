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

> **<img width="1875" height="899" alt="Login" src="https://github.com/user-attachments/assets/1a57f564-9ebc-449b-91e2-0baf150a5ab5" />**
> **<img width="1864" height="887" alt="Register" src="https://github.com/user-attachments/assets/0b834112-0dac-4836-a0fa-2f651800dec2" />**


> *Formulir pendaftaran dengan gaya kaligrafi jepang.*

### 2. Dojo (Dashboard)
Pusat latihan.

> **<img width="1858" height="903" alt="Dashboard" src="https://github.com/user-attachments/assets/041444c8-e063-4eb5-8a9a-eff9314379a2" />**

> *Tampilan utama dengan grafik Enso dan prediksi AI.*

### 3. Anki (Memorization) - Flashcards
Modul hafalan inti menggunakan sistem SRS.
* **Ofuda Cards:** Kartu didesain menyerupai jimat kertas kepercayaan shinto jepang .
* **Hanko Buttons:** Tombol evaluasi(Lupa/Ragu/Ingat).

> **<img width="1870" height="902" alt="flashcard-dboard" src="https://github.com/user-attachments/assets/f2c5fd1a-affb-4568-a66d-2bcf6c74641b" />**
> **<img width="486" height="714" alt="front" src="https://github.com/user-attachments/assets/82849692-a3b9-46ee-8839-9e15734ecacc" />**


> *Tampilan kartu bagian depan (Kanji) dan belakang (Arti).*

### 4. Shiren (The Trial) - Examination
Ujian negara untuk memvalidasi hafalan.
* **Gatekeeping System:** Ujian terkunci jika pengguna belum menghafal minimal 25 kata.
* **Dynamic Quota:** Soal diambil secara cerdas (80% dari kata yang sudah dikuasai).
* **Incense Timer:** Penunjuk waktu visual berupa batang dupa/tinta yang terbakar habis, bukan angka digital.

> **[TEMPEL SCREENSHOT EXAM DI SINI]**
> *Tampilan ujian dengan timer bar dan input gaya kuas.*

### 5. Mibun no Makimono - User Identity
Menu profil interaktif dalam bentuk modal gulungan besar.
* **Avatar:** Custom avatar unik menggunakan *seed generator*.
* **Ink Graph:** Grafik performa memori 7 hari ke depan yang digambar dengan gaya kuas.
* **Kaimei:** Fitur penggantian nama pengguna (Nickname).

> **[TEMPEL SCREENSHOT PROFILE MODAL DI SINI]**
> *Modal profil user dengan grafik retensi memori.*

---

## 🧠 Machine Learning Engine

Aplikasi ini tidak hanya mencatat skor, tetapi "berpikir".
* **Algoritma:** Menggunakan modifikasi *Ebbinghaus Forgetting Curve*.
* **Fungsi:** Memprediksi kapan pengguna akan melupakan sebuah kata dan menyarankan waktu review yang tepat.
* **Logarithmic Stability:** Perhitungan stabilitas memori jangka panjang yang akurat.

---

## Cara Menjalankan di Local

Pastikan Docker Desktop sudah berjalan.

```bash
# 1. Clone repository
git clone https://github.com/4nakbaik/Kaiwa-rift-web-projects.git

# 2. Build & Run Container
docker-compose up --build
