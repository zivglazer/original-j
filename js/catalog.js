/*
  כל התוכן של האתר נמצא כאן.
  כדי להוסיף תכשיט: מעתיקים פריט קיים בתוך items ומשנים את הקוד ואת נתיבי התמונות.
  options: האפשרויות לבחירה מתחת לגלריה (כל אחת עם תמונה משלה, או goto לתמונה אחרת).
  extras: תמונות נוספות בסוף הגלריה. פריט בלי options מוצג בלי בחירה.
  תמונה שעדיין לא קיימת בתיקייה מוצגת כמסגרת ריקה עם שם הקובץ שחסר.
*/
const SILVER = { id: "silver", label: "כסף 925", swatch: "#c9ccd0" };
const GOLD = { id: "gold", label: "זהב 14K", swatch: "#c9a24a" };
const metal = (base, path) => ({ ...base, img: path });

window.CATALOG = {
  contact: {
    whatsapp: "972584500386",
    phoneDisplay: "058-450-0386",
    instagram: "_original_j"
  },

  categories: [
    {
      id: "earrings",
      titleEn: "Women's Earrings",
      title: "עגילי נשים",
      page: "earrings.html",
      cover: "images/earrings/cover.jpg",
      noun: "עגיל",
      choiceLabel: "חומר",
      items: [
        {
          code: "E01", name: "E01",
          options: [metal(GOLD, "images/earrings/e01-gold.jpg"), metal(SILVER, "images/earrings/e01-silver.jpg")],
          extras: [
            { label: "זהב", img: "images/earrings/e01-gold-flat.jpg", metal: "gold" },
            { label: "כסף", img: "images/earrings/e01-silver-flat.jpg", metal: "silver" },
            { label: "שני הצבעים", img: "images/earrings/e01-both.jpg" },
            { label: "על הדוגמנית", img: "images/earrings/e01-silver-model2.jpg", metal: "silver" },
            { label: "על הדוגמנית", img: "images/earrings/e01-gold-model.jpg", metal: "gold" }
          ]
        },
        {
          code: "E02", name: "E02",
          note: "סט דורי (שרשרת + עגילים): 10% הנחה על שניהם",
          options: [metal(GOLD, "images/earrings/e02-gold.jpg"), metal(SILVER, "images/earrings/e02-silver.jpg")],
          extras: [
            { label: "על הדוגמנית", img: "images/earrings/e02-model.jpg", metal: "gold" },
            { label: "על הדוגמנית", img: "images/earrings/e02-gold-model2.jpg", metal: "gold" },
            { label: "על הדוגמנית", img: "images/earrings/e02-silver-model.jpg", metal: "silver" }
          ]
        },
        {
          code: "E03", name: "E03",
          options: [metal(SILVER, "images/earrings/e03-silver.jpg"), metal(GOLD, "images/earrings/e03-gold-1.jpg")],
          extras: [
            { label: "זהב 14K", img: "images/earrings/e03-gold.jpg", metal: "gold" },
            { label: "הזוג", img: "images/earrings/e03-pair.jpg", metal: "silver" },
            { label: "על הדוגמנית", img: "images/earrings/e03-silver-model.jpg", metal: "silver" },
            { label: "על הדוגמנית", img: "images/earrings/ear-stack-model.jpg", metal: "silver" }
          ]
        },
        {
          code: "E04", name: "E04",
          options: [metal(SILVER, "images/earrings/e04-silver.jpg"), metal(GOLD, "images/earrings/e04-gold.jpg")],
          extras: [
            { label: "על הדוגמנית", img: "images/earrings/e04-model.jpg", metal: "silver" },
            { label: "על הדוגמנית", img: "images/earrings/ear-stack-model.jpg", metal: "silver" }
          ]
        },
        {
          code: "E05", name: "E05",
          // עגילי שקד
          options: [metal(SILVER, "images/earrings/e05-silver.jpg"), metal(GOLD, "images/earrings/e05-gold-1.jpg")],
          extras: [
            { label: "הזוג", img: "images/earrings/e04-flat.jpg", metal: "silver" },
            { label: "על הדוגמנית", img: "images/earrings/e05-silver-model.jpg", metal: "silver" }
          ]
        }
      ]
    },
    {
      id: "rings",
      titleEn: "Women's Rings",
      title: "טבעות נשים",
      page: "rings.html",
      cover: "images/rings/cover.jpg",
      noun: "טבעת",
      choiceLabel: "חומר",
      items: [
        {
          code: "R01", name: "R01",
          sizes: ["15", "15.5", "16", "16.5", "17", "17.5", "18"], // מידות טבעת לבחירה
          options: [metal(GOLD, "images/rings/r01-gold.jpg"), metal(SILVER, "images/rings/r01-silver.jpg")],
          extras: [
            { label: "שני הצבעים יחד", img: "images/rings/r01-both.jpg" },
            { label: "על היד", img: "images/rings/r01-model.jpg", metal: "gold" },
            { label: "על הדוגמנית", img: "images/rings/rings-gold-hands.jpg", metal: "gold" }
          ]
        },
        {
          code: "R02", name: "R02",
          options: [metal(GOLD, "images/rings/r02-gold.jpg"), metal(SILVER, "images/rings/r02-silver.jpg")],
          extras: [
            { label: "שני הצבעים יחד", img: "images/rings/r02-both.jpg" },
            { label: "טבעת פתוחה", img: "images/rings/r02-open.jpg" },
            { label: "על היד", img: "images/rings/r02-model.jpg", metal: "silver" },
            { label: "על הדוגמנית", img: "images/rings/rings-gold-hands.jpg", metal: "gold" },
            { label: "על היד", img: "images/rings/rings-hand.jpg", metal: "silver" }
          ]
        },
        {
          code: "R03", name: "R03",
          sizes: ["15", "15.5", "16", "16.5", "17", "17.5", "18"], // מידות טבעת לבחירה
          metals: ["silver"], // בכסף בלבד
          options: [metal(SILVER, "images/rings/r03-silver.jpg")],
          extras: [
            { label: "מלמעלה", img: "images/rings/r03-flat.jpg" },
            { label: "על היד", img: "images/rings/rings-hand.jpg", metal: "silver" }
          ]
        },
        {
          code: "R04", name: "R04",
          sizes: ["15", "15.5", "16", "16.5", "17", "17.5", "18"], // מידות טבעת לבחירה
          metals: ["silver"], // בכסף בלבד
          options: [metal(SILVER, "images/rings/r04-silver.jpg")],
          extras: [
            { label: "מלמעלה", img: "images/rings/r04-flat.jpg" },
            { label: "על היד", img: "images/rings/r04-model.jpg" },
            { label: "על היד", img: "images/rings/rings-hand.jpg", metal: "silver" }
          ]
        },
        {
          code: "R07", name: "R07",
          sizes: ["15", "15.5", "16", "16.5", "17", "14 (זרת)", "14.5 (זרת)"], // מידות טבעת לבחירה, כולל זרת
          // סט אחד: טבעת זהב וטבעת כסף יחד
          metalIncluded: true,
          options: [{ id: "set", label: "זהב 14K + כסף 925", img: "images/rings/r07-set.jpg" }],
          extras: [
            { label: "הסט מלמעלה", img: "images/rings/r07-set-flat.jpg" },
            { label: "על הדוגמנית", img: "images/rings/rings-gold-hands.jpg" }
          ]
        }
      ]
    },
    {
      id: "bracelets",
      titleEn: "Women's Bracelets",
      title: "צמידי נשים",
      page: "bracelets.html",
      cover: "images/bracelets/cover.jpg",
      noun: "צמיד",
      choiceLabel: "חוט ומתכת",
      items: [
        {
          code: "OM",
          name: "צמיד אום",
          single: true, // פריט אחד עם בחירה בין שני הסוגים
          singleLabel: "כסף · חוט אדום / זהב · חוט חום",
          options: [
            { id: "red-silver", label: "כסף · חוט אדום", swatch: "#b3262e", img: "images/bracelets/om-red-silver.jpg" },
            { id: "brown-gold", label: "זהב · חוט חום", swatch: "#6b4a32", img: "images/bracelets/om-brown-gold.jpg" }
          ],
          extras: [
            { label: "צמידי אום", img: "images/bracelets/om-pair.jpg", first: true }
          ]
        },
        {
          code: "OG01", name: "OG01", noun: "צמיד",
          // צמיד אגם: צמיד שרשראות כסף עם חרוז מרובע
          metals: ["silver"], // סוג אחד בלבד
          options: [metal(SILVER, "images/unique/og01-model.jpg")],
          extras: [{ label: "הצמיד", img: "images/unique/og01.jpg" }]
        }
      ]
    },
    {
      id: "necklaces",
      titleEn: "Women's Necklaces",
      title: "שרשראות נשים",
      page: "necklaces.html",
      cover: "images/necklaces/cover.jpg",
      noun: "שרשרת",
      choiceLabel: "חומר",
      items: [
        {
          code: "N01", name: "N01",
          // שרשרת דקה עם תליון ריבועי קטן
          options: [metal(SILVER, "images/necklaces/n01-silver.jpg"), metal(GOLD, "images/necklaces/n01-model.jpg")],
          // אפשר לבחור חוט במקום שרשרת: המחיר זול ב-30 ₪ ממחיר השרשרת
          cords: [
            { id: "red", label: "אדום", swatch: "#b3262e" },
            { id: "green", label: "ירוק", swatch: "#6b7f2a" },
            { id: "brown", label: "חום", swatch: "#4a2f22" },
            { id: "white", label: "לבן", swatch: "#f1efe8" }
          ],
          cordDiscount: 30,
          extras: [{ id: "cords", label: "צבעי החוט", img: "images/necklaces/n01-cords.jpg" }]
        },
        {
          code: "N03", name: "N03",
          // שרשרת חוליות עם לוחית מלבנית: פריט אחד עם בחירה בין כסף לזהב
          single: true,
          singleLabel: "כסף 925 / זהב 14K",
          options: [
            { id: "silver", label: "כסף 925", swatch: "#c9ccd0", price: "" },
            { id: "gold", label: "זהב 14K", swatch: "#c9a24a", price: "" }
          ],
          extras: [
            { label: "השרשרת", img: "images/necklaces/n03-closeup.jpg", first: true },
            { label: "על הדוגמנית", img: "images/necklaces/n03-model.jpg" },
            { label: "השרשרת", img: "images/necklaces/n03.jpg" }
          ]
        },
        {
          code: "N02", name: "N02",
          note: "סט דורי (שרשרת + עגילים): 10% הנחה על שניהם",
          options: [metal(SILVER, "images/necklaces/n02-silver.jpg"), metal(GOLD, "images/necklaces/n02-gold.jpg")],
          extras: [{ label: "על הדוגמנית", img: "images/necklaces/n02.jpg", metal: "silver" }]
        },
        {
          code: "N04", name: "N04",
          // שרשרת דייזי: פריט אחד עם בחירה בין כסף לזהב
          single: true,
          singleLabel: "כסף 925 / זהב 14K",
          options: [
            { id: "silver", label: "כסף 925", swatch: "#c9ccd0", img: "images/necklaces/n04-silver.jpg", price: "" },
            { id: "gold", label: "זהב 14K", swatch: "#c9a24a", img: "images/necklaces/n04-gold.jpg", price: "" }
          ],
          extras: [
            { label: "כסף וזהב", img: "images/necklaces/n04.jpg", first: true },
            { label: "על הדוגמנית", img: "images/necklaces/layered.jpg" },
            { label: "על הדוגמנית", img: "images/necklaces/n04-model-silver.jpg" },
            { label: "על הדוגמנית", img: "images/necklaces/ear-stack-model.jpg", metal: "gold" }
          ]
        }
      ]
    },
    {
      id: "om",
      titleEn: "Om Collection",
      title: "קולקציית אום",
      page: "om.html",
      cover: "images/om/cover.jpg",
      noun: "צמיד",
      choiceLabel: "חוט ומתכת",
      items: [
        {
          code: "OM",
          name: "צמיד אום",
          single: true, // פריט אחד עם בחירה בין שני הסוגים
          singleLabel: "כסף · חוט אדום / זהב · חוט חום",
          options: [
            { id: "red-silver", label: "כסף · חוט אדום", swatch: "#b3262e", img: "images/bracelets/om-red-silver.jpg" },
            { id: "brown-gold", label: "זהב · חוט חום", swatch: "#6b4a32", img: "images/bracelets/om-brown-gold.jpg" }
          ],
          extras: [
            { label: "צמידי אום", img: "images/bracelets/om-pair.jpg", first: true }
          ]
        },
        {
          code: "N01", name: "N01",
          noun: "שרשרת",
          // שרשרת דקה עם תליון אום ריבועי קטן (אותה שרשרת כמו בשרשראות נשים)
          options: [metal(SILVER, "images/necklaces/n01-silver.jpg"), metal(GOLD, "images/necklaces/n01-model.jpg")],
          // אפשר לבחור חוט במקום שרשרת: המחיר זול ב-30 ₪ ממחיר השרשרת
          cords: [
            { id: "red", label: "אדום", swatch: "#b3262e" },
            { id: "green", label: "ירוק", swatch: "#6b7f2a" },
            { id: "brown", label: "חום", swatch: "#4a2f22" },
            { id: "white", label: "לבן", swatch: "#f1efe8" }
          ],
          cordDiscount: 30,
          extras: [{ id: "cords", label: "צבעי החוט", img: "images/necklaces/n01-cords.jpg" }]
        }
      ]
    },
    {
      id: "men",
      titleEn: "Men's Jewelry",
      title: "תכשיטי גברים",
      metals: ["silver"], // תכשיטי הגברים בכסף בלבד
      page: "men.html",
      cover: "images/men/cover.jpg",
      noun: "תכשיט",
      choiceLabel: "צבע חוט",
      items: [
        {
          code: "M01",
          name: "צמיד חוט ליפוף אחד",
          noun: "צמיד",
          sizes: ["18", "20", "22"], sizeUnit: 'ס"מ', // מידות לבחירה
          // כל צבע מוביל לתמונת החוטים.
          options: [
            { id: "light-brown", label: "חום בהיר", swatch: "#a77b52", goto: "threads" },
            { id: "dark-brown", label: "חום כהה", swatch: "#4a2f22", goto: "threads" },
            { id: "green", label: "ירוק", swatch: "#5f6b45", goto: "threads" },
            { id: "dark-blue", label: "כחול כהה", swatch: "#24384f", goto: "threads" },
            { id: "light-blue", label: "כחול בהיר", swatch: "#3f7fae", goto: "threads" },
            { id: "sky", label: "תכלת", swatch: "#8fb9d6", goto: "threads" },
            { id: "dark-gray", label: "אפור כהה", swatch: "#4a4c4f", goto: "threads" },
            { id: "white", label: "לבן", swatch: "#f1efe8", goto: "threads" },
            { id: "navy", label: "כחול נייבי", swatch: "#1d2a4a", goto: "threads" }
          ],
          extras: [
            { id: "bracelet", label: "ליפוף אחד", img: "images/men/m01-single.jpg", first: true },
            { id: "threads", label: "צבעי החוט", img: "images/men/m01-threads.jpg" }
          ]
        },
        {
          code: "M04",
          name: "צמיד חוט שני ליפופים",
          noun: "צמיד",
          sizes: ["36", "40", "42"], sizeUnit: 'ס"מ', // מידות לבחירה
          options: [
            { id: "light-brown", label: "חום בהיר", swatch: "#a77b52", goto: "threads4" },
            { id: "dark-brown", label: "חום כהה", swatch: "#4a2f22", goto: "threads4" },
            { id: "green", label: "ירוק", swatch: "#5f6b45", goto: "threads4" },
            { id: "dark-blue", label: "כחול כהה", swatch: "#24384f", goto: "threads4" },
            { id: "light-blue", label: "כחול בהיר", swatch: "#3f7fae", goto: "threads4" },
            { id: "sky", label: "תכלת", swatch: "#8fb9d6", goto: "threads4" },
            { id: "dark-gray", label: "אפור כהה", swatch: "#4a4c4f", goto: "threads4" },
            { id: "white", label: "לבן", swatch: "#f1efe8", goto: "threads4" },
            { id: "navy", label: "כחול נייבי", swatch: "#1d2a4a", goto: "threads4" }
          ],
          extras: [
            { id: "bracelet", label: "שני ליפופים", img: "images/men/m04-double.jpg", first: true },
            { id: "threads4", label: "צבעי החוט", img: "images/men/m01-threads.jpg" },
            { label: "על היד", img: "images/men/m04-model.jpg" }
          ]
        },
        {
          code: "M02",
          name: "שרשרת לוחית",
          noun: "שרשרת",
          options: [],
          extras: [
            { label: "השרשרת", img: "images/men/m02.jpg" },
            { label: "על הדוגמן", img: "images/men/m02-model.jpg" }
          ]
        },
        {
          code: "M03",
          name: "שרשרת",
          noun: "שרשרת",
          options: [],
          extras: [{ label: "על הדוגמן", img: "images/men/m03-2.jpg" }]
        },
        {
          code: "M05",
          name: "עגיל חישוק קטן",
          noun: "עגיל",
          options: [],
          extras: [{ label: "על הדוגמן", img: "images/men/m05-hoop.jpg" }]
        },
        {
          code: "R05", name: "R05", noun: "טבעת",
          sizes: ["18", "19", "20", "21"], // מידות טבעת לבחירה
          options: [metal(SILVER, "images/rings/r05-silver.jpg")],
          extras: [{ label: "מהצד", img: "images/rings/r05-top.jpg" }]
        }
      ]
    },
    {
      id: "gift",
      titleEn: "Gift Card",
      title: "גיפט קארד",
      page: "gift-card.html",
      cover: "images/gift/gift-card.jpg",
      noun: "גיפט קארד",
      choiceLabel: "סכום",
      items: [
        {
          code: "GIFT", name: "Gift Card",
          single: true,
          // המחיר של כל סכום כתוב כאן
          options: [
            { id: "200", label: "200 ₪", price: "200" },
            { id: "350", label: "350 ₪", price: "350" },
            { id: "400", label: "400 ₪", price: "400" }
          ],
          extras: [{ label: "Gift Card", img: "images/gift/gift-card.jpg", first: true }]
        }
      ]
    },
    {
      id: "unique",
      titleEn: "One of a Kind",
      title: "One of a Kind",
      page: "one-of-a-kind.html",
      cover: "images/unique/og07.jpg",
      noun: "תכשיט",
      choiceLabel: "חומר",
      soon: "כל תכשיט כאן נעשה בעותק אחד בלבד. התכשיטים הראשונים יעלו בקרוב.",
      metals: ["silver"],
      items: [
        {
          code: "OG02", name: "OG02", noun: "צמיד",
          // צמיד קשיח פתוח בכסף
          note: 'לנשים · 14 ס"מ', // מופיע ליד המחיר
          options: [metal(SILVER, "images/unique/og02.jpg")],
          extras: [{ label: "על היד", img: "images/unique/og02-model.jpg" }]
        },
        {
          code: "OG03", name: "OG03", noun: "צמיד",
          single: true,
          singleLabel: "שרשרת כסף 925 · לוחית זהב 14K",
          extras: [{ label: "צמיד ORIGINAL", img: "images/unique/og03.jpg", first: true }],
          options: []
        },
        {
          code: "OG555", name: "OG555", noun: "תליון",
          metals: ["gold"], // זהב 14K בלבד
          options: [metal(GOLD, "images/unique/og555.jpg")],
          extras: []
        },
        {
          code: "OG05", name: "OG05", noun: "צמיד",
          // צמיד עור עם לוחית כסף
          options: [metal(SILVER, "images/unique/og05.jpg")],
          extras: []
        },
        {
          code: "OG06", name: "OG06", noun: "טבעת",
          // טבעת כסף רחבה עם אבנים
          options: [metal(SILVER, "images/unique/og06.jpg")],
          extras: []
        },
        {
          code: "OG07", name: "OG07", noun: "שרשרת",
          // שרשרת תליון עגול בכסף
          options: [metal(SILVER, "images/unique/og07.jpg")],
          extras: []
        },
        {
          code: "R06", name: "R06", noun: "טבעת",
          sizes: ["18"], // עותק אחד במידה 18
          // טבעת עומר: טבעת כסף רחבה עם חריטה
          options: [metal(SILVER, "images/rings/r06-silver.jpg")],
          extras: []
        }
      ]
    }
  ]
};
