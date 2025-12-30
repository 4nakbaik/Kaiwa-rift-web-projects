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
**Ink Path Enso:** Visualisasi progres mastery bahasa jepang yang terisi secara otomatis.
**Shouma-sensei:** Model ML yang memberikan nasihat belajar berdasarkan data retensi memori user.
**Navigation:** Menu navigasi yang menunjukkan arah bertarung(belajar ye maksudnya).

> **<img width="1858" height="903" alt="Dashboard" src="https://github.com/user-attachments/assets/041444c8-e063-4eb5-8a9a-eff9314379a2" />**

> *Tampilan utama dengan grafik Enso dan prediksi AI.*

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
Menu profil interaktif dalam bentuk gulungan kuno.
* **Graph:** Grafik performa memori 7 hari ke depan.
* **Kaimei:** Fitur penggantian username.

> **<img width="525" height="588" alt="identity1" src="https://github.com/user-attachments/assets/4f6e7e27-dfdb-4e38-992b-f054c1a39c4e" />**
> **<img width="525" height="588" alt="identity2" src="https://github.com/user-attachments/assets/bd4b90b6-3c24-49da-8079-e1a36b8df571" />**

> *profil user dengan grafik retensi memori.*

---

## Machine Learning 

Web ini tidak hanya mencatat skor, tetapi "berpikir".
* **Algoritma:** Menggunakan modifikasi *Ebbinghaus Forgetting Curve*.
* **Fungsi:** Memprediksi kapan pengguna akan melupakan sebuah kata dan menyarankan waktu review yang tepat.
* **Logarithmic Stability:** Perhitungan stabilitas memori jangka panjang yang akurat.

> **<img width="934" height="579" alt="Screenshot 2025-12-31 014510" src="https://github.com/user-attachments/assets/ba516d47-79e8-4204-88a2-ba808d0483e8" />**



> *contoh hasil grafik visualisasi dari projek web ini.*


---

## Instruksi install

Pastikan Docker Desktop sudah berjalan.

```bash
# 1. Clone repository
git clone https://github.com/4nakbaik/Kaiwa-rift-web-projects.git

# 2. Build & Run Container
docker-compose up --build
