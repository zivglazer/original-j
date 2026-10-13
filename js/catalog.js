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
    instagram: "original_j_"
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
            { label: "שני הצבעים", img: "images/earrings/e01-both.jpg" }
          ]
        },
        {
          code: "E02", name: "E02",
          options: [metal(GOLD, "images/earrings/e02-gold.jpg"), metal(SILVER, "images/earrings/e02-silver.jpg")],
          extras: [{ label: "על הדוגמנית", img: "images/earrings/e02-model.jpg", metal: "gold" }]
        },
        {
          code: "E03", name: "E03",
          options: [metal(SILVER, "images/earrings/e03-silver.jpg"), metal(GOLD, "images/earrings/e03-gold.jpg")],
          extras: [{ label: "הזוג", img: "images/earrings/e03-pair.jpg" }]
        },
        {
          code: "E04", name: "E04",
          options: [metal(SILVER, "images/earrings/e04-silver.jpg")],
          extras: [
            { label: "הזוג", img: "images/earrings/e04-flat.jpg" },
            { label: "על הדוגמנית", img: "images/earrings/e04-model.jpg" }
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
          options: [metal(GOLD, "images/rings/r01-gold.jpg"), metal(SILVER, "images/rings/r01-silver.jpg")],
          extras: [
            { label: "שני הצבעים יחד", img: "images/rings/r01-both.jpg" },
            { label: "על היד", img: "images/rings/r01-model.jpg", metal: "gold" }
          ]
        },
        {
          code: "R02", name: "R02",
          options: [metal(GOLD, "images/rings/r02-gold.jpg"), metal(SILVER, "images/rings/r02-silver.jpg")],
          extras: [
            { label: "שני הצבעים יחד", img: "images/rings/r02-both.jpg" },
            { label: "טבעת פתוחה", img: "images/rings/r02-open.jpg" },
            { label: "על היד", img: "images/rings/r02-model.jpg" }
          ]
        },
        {
          code: "R03", name: "R03",
          metals: ["silver"], // בכסף בלבד
          options: [metal(SILVER, "images/rings/r03-silver.jpg")],
          extras: [{ label: "מלמעלה", img: "images/rings/r03-flat.jpg" }]
        },
        {
          code: "R04", name: "R04",
          metals: ["silver"], // בכסף בלבד
          options: [metal(SILVER, "images/rings/r04-silver.jpg")],
          extras: [
            { label: "מלמעלה", img: "images/rings/r04-flat.jpg" },
            { label: "על היד", img: "images/rings/r04-model.jpg" }
          ]
        },,
        {
          code: "R07", name: "R07",
          // סט אחד: טבעת זהב וטבעת כסף יחד
          metalIncluded: true,
          options: [{ id: "set", label: "זהב 14K + כסף 925", img: "images/rings/r07-set.jpg" }],
          extras: [{ label: "הסט מלמעלה", img: "images/rings/r07-set-flat.jpg" }]
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
          metalIncluded: true,
          options: [
            { id: "red-silver", label: "חוט אדום · כסף 925", swatch: "#b3262e", img: "images/bracelets/om-red-silver.jpg" },
            { id: "brown-gold", label: "חוט חום · זהב 14K", swatch: "#6b4a32", img: "images/bracelets/om-brown-gold.jpg" }
          ],
          extras: [
            { label: "שני הסוגים", img: "images/bracelets/om-both.jpg" },
            { label: "על היד", img: "images/bracelets/om-model.jpg", metal: "red-silver" }
          ]
        },
        {
          code: "B02", name: "צמיד ORIGINAL",
          single: true, // סוג אחד בלבד
          singleLabel: "שרשרת כסף 925 · לוחית זהב 14K",
          options: [],
          extras: [
            { label: "הצמיד", img: "images/bracelets/b02.jpg" },
            { label: "על היד", img: "images/bracelets/b02-model.jpg" }
          ]
        },
        {
          code: "B03", name: "B03",
          metals: ["silver"], // סוג אחד בלבד
          options: [metal(SILVER, "images/bracelets/b03.jpg")],
          extras: [{ label: "על היד", img: "images/bracelets/b03-model.jpg" }]
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
          extras: []
        },
        {
          code: "N03", name: "N03",
          // שרשרת חוליות עם לוחית מלבנית
          options: [metal(GOLD, "images/necklaces/n01-gold.jpg")],
          extras: []
        },
        {
          code: "N02", name: "N02",
          options: [],
          extras: [{ label: "על הדוגמנית", img: "images/necklaces/n02.jpg" }]
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
          metalIncluded: true,
          options: [
            { id: "red-silver", label: "חוט אדום · כסף 925", swatch: "#b3262e", img: "images/bracelets/om-red-silver.jpg" },
            { id: "brown-gold", label: "חוט חום · זהב 14K", swatch: "#6b4a32", img: "images/bracelets/om-brown-gold.jpg" }
          ],
          extras: [
            { label: "שני הסוגים", img: "images/bracelets/om-both.jpg" },
            { label: "על היד", img: "images/bracelets/om-model.jpg", metal: "red-silver" }
          ]
        },
        {
          code: "N01", name: "N01",
          noun: "שרשרת",
          // שרשרת דקה עם תליון אום ריבועי קטן (אותה שרשרת כמו בשרשראות נשים)
          options: [metal(SILVER, "images/necklaces/n01-silver.jpg"), metal(GOLD, "images/necklaces/n01-model.jpg")],
          extras: []
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
          extras: [{ label: "על הדוגמן", img: "images/men/m03.jpg" }]
        },
        {
          code: "R05", name: "R05", noun: "טבעת",
          options: [metal(SILVER, "images/rings/r05-silver.jpg")],
          extras: [{ label: "מהצד", img: "images/rings/r05-top.jpg" }]
        },
        {
          code: "R06", name: "R06", noun: "טבעת",
          options: [metal(SILVER, "images/rings/r06-silver.jpg")],
          extras: []
        }
      ]
    },
    {
      id: "unique",
      titleEn: "One of a Kind",
      title: "One of a Kind",
      page: "one-of-a-kind.html",
      cover: "", // אין עדיין תמונה
      noun: "תכשיט",
      choiceLabel: "חומר",
      soon: "כל תכשיט כאן נעשה בעותק אחד בלבד. התכשיטים הראשונים יעלו בקרוב.",
      items: []
    }
  ]
};
