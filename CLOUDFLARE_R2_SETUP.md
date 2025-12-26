# Cloudflare R2 Video Upload - Setup Guide

## ✅ Шта је урађено

### 1. **Креиране Firebase Cloud Functions за R2 Upload** (`backend/functions/src/uploadVideoToR2.js`)
   - ✅ `uploadVideoToR2` - Upload videa na Cloudflare R2
   - ✅ `deleteVideoFromR2` - Brisanje videa sa Cloudflare R2
   - **SIGURNO**: Kredencijali se čuvaju samo na backend-u
   - **VALIDACIJA**: Admin provera, file size (max 500MB), file type
   - **METADATA**: Automatsko čuvanje informacija o upload-u

### 2. **Ažuriran Frontend Service** (`frontend/src/services/cloudflare.service.js`)
   - **UKLONJEN** direktan upload sa AWS SDK
   - **DODAT** upload preko Firebase Cloud Functions
   - Base64 konverzija fajlova
   - Progress callback za prikazivanje procenta upload-a
   - Detaljno error handling

### 3. **LessonManager** (`frontend/src/components/admin/LessonManager.jsx`)
   - Koristi novi backend endpoint za upload
   - Edit funkcionalnost za lekcije
   - Custom ConfirmModal umesto window.confirm()
   - Detaljni console logs za debugging

### 4. **Backend Konfiguracija**
   - Firebase Functions config za Cloudflare R2 kredencijale
   - AWS SDK dependency u backend/functions
   - Automatsko učitavanje environment variables

---

## 🔧 Следећи кораци - ОБАВЕЗНО

### Корак 1: Креирај Cloudflare R2 Bucket

1. Иди на https://dash.cloudflare.com/
2. У левом менију изабери **R2**
3. Кликни **Create bucket**
4. Унеси име: `nauci-srpski-videos` (или било које друго)
5. Регион: **Automatic** (препоручено)
6. Кликни **Create bucket**

### Корак 2: Креирај API Token

1. У Cloudflare Dashboard, иди на **R2 → Manage R2 API Tokens**
2. Кликни **Create API Token**
3. Конфигурација:
   - **Token name**: `nauci-srpski-upload`
   - **Permissions**:
     - ✅ Object Read & Write
     - ✅ (или Admin Read & Write за све buckets)
   - **TTL**: Never expires (или постави време)
4. Кликни **Create API Token**
5. **КОПИРАЈ** следеће вредности (НЕ ЗАТВАРАЈ страницу док не копираш!):
   - Access Key ID
   - Secret Access Key

### Корак 3: Пронађи Account ID

1. У Cloudflare Dashboard, иди на **R2 → Overview**
2. Account ID се налази у десном углу или у URL-у
3. Биће у формату: `1234567890abcdef1234567890abcdef`

### Корак 4: Подеси Firebase Functions Config

**ВАЖНО**: Kredencijali se NE čuvaju u frontend-u! Postavljaju se samo na backend.

Iz backend/functions direktorijuma, pokreni:

```bash
cd backend/functions

firebase functions:config:set \
  cloudflare.account_id="TVOJ_ACCOUNT_ID" \
  cloudflare.r2_access_key_id="TVOJ_ACCESS_KEY_ID" \
  cloudflare.r2_secret_access_key="TVOJ_SECRET_ACCESS_KEY" \
  cloudflare.r2_bucket_name="video-kursevi" \
  cloudflare.r2_public_url="https://pub-xxxx.r2.dev"
```

**Napomena:**
- Zameni vrednosti sa pravim Cloudflare R2 kredencijalima
- `r2_public_url` može biti R2.dev URL ili custom domain

Nakon postavljanja config-a, deploy functions:
```bash
npm run deploy
```

### Корак 5: Подеси Public Access (Опционо али препоручено)

Да би видеи били доступни корисницима, bucket мора бити public:

**Опција А: R2.dev Domain (Брзо)**
1. У bucket settings, кликни **Settings**
2. Scroll до **Public access**
3. Кликни **Allow Access**
4. Bucket URL ће бити: `https://nauci-srpski-videos.r2.dev`

**Опција Б: Custom Domain (Професионално)**
1. У bucket settings, иди на **Settings → Custom Domains**
2. Кликни **Connect Domain**
3. Унеси: `videos.naucisprski.com`
4. Следи инструкције за DNS setup
5. Cloudflare ће аутоматски креирати SSL сертификат

### Корак 6: Testiranje

Sada možete testirati upload videa:

1. Pokreni frontend dev server:
```bash
cd frontend
npm run dev
```

2. Idi na Admin panel → Lekcije
3. Dodaj novu lekciju sa video fajlom
4. Proveri console za logove upload procesa

---

## 🧪 Тестирање

### Тест 1: Upload новог видеа
1. Иди на **Admin → Лекције**
2. Одабери курс и модул
3. Кликни **Додај лекцију**
4. Попуни форму и одабери видео фајл
5. Кликни **Додај лекцију**
6. **Провери console** за логове:
   ```
   🔵 [LessonManager] Creating new lesson...
   🔵 [LessonManager] Uploading video to Cloudflare R2...
   🔵 [cloudflare.service] Starting video upload to Cloudflare R2...
   📊 [LessonManager] Upload progress: 100%
   ✅ [cloudflare.service] Upload successful!
   ✅ [LessonManager] Lesson created successfully
   ```

### Тест 2: Измена лекције
1. Кликни **Edit** дугме на постојећој лекцији
2. Промени назив или опис
3. Опционо: Отпреми нови видео
4. Кликни **Сачувај измене**
5. **Провери console** за логове:
   ```
   🔵 [LessonManager] Updating lesson: xyz123
   🔵 [LessonManager] Deleting old video from R2: videos/...
   ✅ [LessonManager] Lesson updated successfully
   ```

### Тест 3: Брисање лекције
1. Кликни **Trash** дугме
2. Провери да се појави custom confirm modal (не Google popup!)
3. Кликни **Потврди**
4. **Провери console**:
   ```
   🔵 [LessonManager] Deleting lesson: xyz123
   🔵 [LessonManager] Deleting video from R2: videos/...
   ✅ [LessonManager] Lesson deleted successfully
   ```

---

## ❌ Грешке и решења

### Грешка: "Cloudflare R2 није конфигурисан"
**Узрок**: Нису унети креденцијали у .env фајл
**Решење**:
1. Провери да ли си заменио placeholder вредности у `.env`
2. Рестартуј `npm run dev`
3. Провери да environment variables почињу са `VITE_`

### Грешка: "Access Denied" или 403
**Узрок**: API Token нема одговарајуће permissions
**Решење**:
1. Иди у Cloudflare R2 → Manage R2 API Tokens
2. Провери да токен има **Object Read & Write** permissions
3. Ако не, креирај нови token

### Грешка: Видео се не приказује у browser-у
**Узрок**: Bucket није public
**Решење**:
1. Провери **Public access** у bucket settings
2. Провери да ли је `VITE_CLOUDFLARE_R2_PUBLIC_URL` тачан
3. Ако користиш Custom Domain, провери DNS records

### Грешка: "No such bucket"
**Узрок**: Погрешно име bucket-а
**Решење**:
1. Провери `VITE_CLOUDFLARE_R2_BUCKET_NAME` у `.env`
2. Провери да bucket заиста постоји у Cloudflare Dashboard

---

## 📊 Разлике: Firebase Storage vs Cloudflare R2

| Карактеристика | Firebase Storage | Cloudflare R2 |
|----------------|------------------|---------------|
| **Цена storage** | $0.026/GB/месец | $0.015/GB/месec |
| **Download цена** | $0.12/GB | **БЕСПЛАТНО** ⭐ |
| **Upload цена** | $0.12/GB | **БЕСПЛАТНО** ⭐ |
| **Лимит** | Ограничен free tier | 10GB free, онда јефтино |
| **CDN** | Firebase CDN | Cloudflare Global CDN |
| **Брзина** | Добра | Одлична ⚡ |

**За видео streaming, Cloudflare R2 је далеко економичнији избор!**

---

## 📝 Важне напомене

1. **НЕ commituj .env фајл са правим креденцијалима на GitHub!**
   - `.env` је већ у `.gitignore`
   - Креденцијале чувај безбедно (нпр. у password manager-у)

2. **Стари видеи на Firebase Storage**:
   - Нови видеи иду на Cloudflare R2
   - Стари видеи остају на Firebase (ако су постојали)
   - Можеш их ручно обрисати касније

3. **Public URL формат**:
   - R2.dev: `https://bucket-name.r2.dev/path/to/video.mp4`
   - Custom: `https://videos.naucisprski.com/path/to/video.mp4`

4. **Video format препорука**:
   - MP4 (H.264 codec) за најбољу компатибилност
   - Максимална величина: 500MB (може се променити у `LessonManager.jsx` линија 98)

---

## 🎉 Закључак

✅ Video upload је пребачен са Firebase Storage на Cloudflare R2
✅ Додата Edit функционалност за лекције
✅ Замењени Google confirm dialogs са custom modal-има
✅ Додати детаљни console logs за debugging

**Следећи корак**: Унеси Cloudflare R2 креденцијале и тестирај upload!

Ако има проблема, провери console за детаљне логове. Сви логови користе emoji префиксе:
- 🔵 = Почетак операције
- ✅ = Успех
- ❌ = Грешка
- 📊 = Статистика
