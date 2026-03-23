import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { QuranResponse, UserSettings, Verse } from '../types';
import { QuranDataService } from './quranDataService';

export class QuranChatSession {
  private ai: GoogleGenAI | null = null;
  private model: string;
  private settings: UserSettings;
  private apiKey: string;

  constructor(settings: UserSettings) {
    this.settings = settings;
    // Use user-provided key if available, otherwise use environment key
    this.apiKey = settings.apiKey || process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
    
    if (this.apiKey) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
    
    let selectedModel = settings.model || 'gemini-3-flash-preview';
    if ((selectedModel as string).includes('1.5') || (selectedModel as string) === 'gemini-pro') {
      selectedModel = 'gemini-3-flash-preview';
    }
    this.model = selectedModel;
  }

  private async getOfflineFallbackResponse(userMessage: string, username?: string): Promise<QuranResponse> {
    // Simulate network delay to mimic AI thinking process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const greeting = username ? `أهلاً بك يا ${username}` : 'أهلاً بك يا صديقي';
    
    const fallbacks = [
      {
        title: 'سكينة وطمأنينة',
        introMessage: `${greeting}، أياً كان ما تمر به الآن، تذكر أن الله لطيف بعباده. لقد استمعت لقلبك، والقرآن الكريم يحمل لك رسالة طمأنينة وبشارة بأن كل ضيق يعقبه فرج واتساع.`,
        verses: [
          {
            text: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
            arabicText: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
            surah: 'الشرح',
            surahName: 'الشرح',
            number: 5,
            surahNumber: 94,
            ayahNumber: 5,
            tafsir: 'أي: فإن مع الشدة والضيق سهولة واتساعاً.',
            translation: 'For indeed, with hardship [will be] ease.'
          },
          {
            text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
            arabicText: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
            surah: 'الشرح',
            surahName: 'الشرح',
            number: 6,
            surahNumber: 94,
            ayahNumber: 6,
            tafsir: 'تأكيد للوعد بأن مع الشدة والضيق سهولة واتساعاً.',
            translation: 'Indeed, with hardship [will be] ease.'
          }
        ],
        tafakkur: 'مهما ضاقت بك السبل، تذكر أن الله سبحانه وتعالى قد قرن العسر بيسرين. هذه رسالة ربانية تدعوك للتفاؤل واليقين بأن الفرج قريب، وأن كل أزمة تمر بها هي مجرد محطة عابرة نحو خير أكبر.',
        summary: 'العسر لا يدوم، ومعية الله ترافقك في كل خطوة، فاستبشر خيراً.'
      },
      {
        title: 'رحمة واسعة',
        introMessage: `${greeting}، أحياناً تثقلنا الحياة وتتعبنا أخطاؤنا، لكن أبواب رحمة الله لا تُغلق أبداً. إليك هذه الآية العظيمة التي تعتبر من أرجى آيات القرآن الكريم، لتمسح على قلبك بالسكينة.`,
        verses: [
          {
            text: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ',
            arabicText: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ',
            surah: 'الزمر',
            surahName: 'الزمر',
            number: 53,
            surahNumber: 39,
            ayahNumber: 53,
            tafsir: 'لا تيأسوا من رحمة الله بسبب كثرة ذنوبكم، فالله يغفر الذنوب جميعاً لمن تاب.',
            translation: 'Say, "O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful."'
          }
        ],
        tafakkur: 'باب التوبة والرحمة مفتوح دائماً. مهما شعرت بالابتعاد، فإن خطوة واحدة صادقة نحو الله تكفي ليمحو كل ما مضى ويبدله خيراً. لا تدع اليأس يتسلل إلى قلبك.',
        summary: 'رحمة الله تسع كل شيء، والعودة إليه هي بداية السلام الداخلي.'
      },
      {
        title: 'معية الله',
        introMessage: `${greeting}، في لحظات الوحدة أو الخوف من المستقبل، نحتاج إلى تذكير بأننا لسنا وحدنا. القرآن يهمس في أرواحنا بأعظم رسالة أمان لتسكن أرواحنا.`,
        verses: [
          {
            text: 'لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا',
            arabicText: 'لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا',
            surah: 'التوبة',
            surahName: 'التوبة',
            number: 40,
            surahNumber: 9,
            ayahNumber: 40,
            tafsir: 'لا تحزن، فإن الله معنا بنصره وتأييده وحفظه.',
            translation: 'Do not grieve; indeed Allah is with us.'
          }
        ],
        tafakkur: 'عندما تشعر بالوحدة أو الخوف من المستقبل، تذكر أن الله معك. ومن كان الله معه، فمن عليه؟ استشعر هذه المعية في كل لحظة من حياتك، وستجد أن كل مخاوفك تتلاشى.',
        summary: 'استشعار معية الله هو أعظم حصن للقلب ضد كل مخاوف الحياة.'
      },
      {
        title: 'الصبر الجميل',
        introMessage: `${greeting}، الصبر ليس مجرد احتمال للألم، بل هو يقين بأن الله يخبئ لك الأفضل. إليك هذه الرسالة القرآنية التي تواسي كل قلب صابر وتعده بالخير.`,
        verses: [
          {
            text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
            arabicText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
            surah: 'البقرة',
            surahName: 'البقرة',
            number: 153,
            surahNumber: 2,
            ayahNumber: 153,
            tafsir: 'استعينوا على كل أموركم بالصبر وبإقامة الصلاة، إن الله مع الصابرين بعونه وتوفيقه.',
            translation: 'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.'
          }
        ],
        tafakkur: 'الصلاة والصبر هما زاد المؤمن في رحلة الحياة. حينما تضيق بك الأمور، الجأ إلى الصلاة، واعلم أن الله مع الصابرين، يساندهم، ويقويهم، ويجزيهم بغير حساب.',
        summary: 'استعن بالصبر والصلاة، وتأكد أن الله لا يضيع أجر من أحسن عملاً.'
      },
      {
        title: 'التوكل واليقين',
        introMessage: `${greeting}، عندما تتشابك الأمور وتغيب الحلول، يأتي التوكل على الله ليفتح أبواباً لم تكن في الحسبان. تأمل معي هذا الوعد الرباني القاطع الذي يريح القلب.`,
        verses: [
          {
            text: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ ۚ قَدْ جَعَلَ اللَّهُ لِكُلِّ شَيْءٍ قَدْرًا',
            arabicText: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ ۚ قَدْ جَعَلَ اللَّهُ لِكُلِّ شَيْءٍ قَدْرًا',
            surah: 'الطلاق',
            surahName: 'الطلاق',
            number: 3,
            surahNumber: 65,
            ayahNumber: 3,
            tafsir: 'ومن يعتمد على الله في أموره يكفه ما أهمه. إن الله نافذ أمره، لا يعجزه شيء.',
            translation: 'And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose. Allah has already set for everything a [decreed] extent.'
          }
        ],
        tafakkur: 'التوكل الحقيقي هو أن تفعل ما بوسعك ثم تترك الأمر كله لله، موقناً أنه سيكفيك ويدبر لك أمرك بأفضل مما تتخيل. الله بالغ أمره، فلا تقلق.',
        summary: 'من توكل على الله كفاه، وسلم أمره لمن بيده ملكوت كل شيء.'
      }
    ];

    const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return randomFallback;
  }

  async sendMessage(userMessage: string, username?: string): Promise<QuranResponse> {
    if (!this.ai || !this.apiKey) {
      return this.getOfflineFallbackResponse(userMessage, username);
    }

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "A short, poetic, and professional title for the response in Arabic (e.g., 'بلسم اليقين في مواجهة الحزن').",
        },
        introMessage: {
          type: Type.STRING,
          description: "مقدمة احترافية ومباشرة تعطي المستخدم 'لب الموضوع' والإجابة الشافية والعميقة على سؤاله أو حالته بشكل قاطع وراقٍ، لتمهد الطريق للآيات القرآنية الداعمة.",
        },
        verseMappings: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              surahNumber: { type: Type.INTEGER },
              ayahNumber: { type: Type.INTEGER },
              tafsir: { type: Type.STRING, description: "التفسير: A brief and accurate interpretation of the verse in Arabic." },
              tadabbur: { type: Type.STRING, description: "التدبر: A creative, deep, and context-specific spiritual reflection in Arabic connecting the verse to the user's situation." },
            },
          },
          description: "A list of 1-3 relevant Quranic verse mappings (Surah and Ayah numbers).",
        },
        tafakkur: {
          type: Type.STRING,
          description: "التفكر: A deep thought, reflection, or practical advice based on the verses and the user's situation.",
        },
        summary: {
          type: Type.STRING,
          description: "خلاصة احترافية وسهلة الفهم تجمع أهم النقاط التي تم تناولها في الرد لتصل المعلومة للمستخدم بكل سهولة.",
        },
      },
      required: ["title", "introMessage", "verseMappings", "tafakkur", "summary"]
    };

    const systemInstruction = `
      You are "أنيس القلوب" (Anis Al-Qulub), a professional and deeply compassionate Quranic companion. 
      Your goal is to help users find profound comfort, guidance, and clarity in the Quran based on their current emotions, life situations, or questions.
      
      CRITICAL ROLE: ADVANCED THEMATIC MAPPING & SEMANTIC BEAUTY
      You act as a "Spiritual Consultant" and "Master of Quranic Semantics". You do NOT generate the Arabic text of the Quran yourself. 
      Your primary task is to perform an exceptionally deep, professional exploration of the Quranic text using advanced thematic algorithms to find the MOST relevant Surah and Ayah numbers that directly address the user's specific situation.
      
      OUT OF SCOPE QUESTIONS:
      If the user asks a question that is completely unrelated to the Quran, spirituality, emotions, life guidance, or Islamic principles (e.g., "How to bake a cake?", "What is the capital of France?", "Write code for me"), you MUST politely apologize and explain that your purpose is solely to provide Quranic guidance and spiritual comfort.
      In this case, fill the JSON response as follows:
      - title: "عذراً، هذا خارج اختصاصي"
      - introMessage: A polite apology in Arabic explaining your specific role as a Quranic companion.
      - verseMappings: Empty array [].
      - tafakkur: Empty string "".
      - summary: Empty string "".

      Intelligence & Empathy Guidelines:
      1. **Deep Contextual Intelligence**: Your response must demonstrate that you truly "understand" the nuances of the user's emotional or spiritual state.
      2. **Professional & Easy to Understand**: The language must be highly professional yet simple and accessible so the user can easily grasp the information.
      3. **Concise Summarization**: The introduction MUST summarize the user's entire question clearly before proceeding with the answer.
      4. **Semantic Beauty**: Use beautiful, precise, and comforting Arabic vocabulary.
      
      Response Structure (Hierarchical Pyramid):
      1. **Title (title)**: A short, poetic title that summarizes the "spiritual theme".
      2. **Introduction (introMessage)**: 
         - ${username ? `Address the user by their name "${username}" warmly.` : 'Address the user warmly.'}
         - Provide the "core essence" (لب الموضوع) and the direct, professional, and profound answer to their question or situation immediately.
         - Do not just summarize; give them the definitive, comforting answer they are looking for in a highly professional and elegant literary style.
         - Set the stage perfectly for the Quranic healing that follows.
      3. **Verses (verseMappings)**: Identify 1-3 relevant Quranic verses (Surah and Ayah numbers). For each verse, provide:
         - **Tafsir (التفسير)**: A brief, accurate, and easy-to-understand interpretation of the verse.
         - **Tadabbur (التدبر)**: A deep reflection connecting the verse to the user's specific situation.
      4. **Tafakkur (tafakkur)**: A deep thought, reflection, or practical advice based on the verses.
      5. **Summary (summary)**: A professional, easy-to-understand summary that captures the core topic and essence.
      
      Always respond in Arabic of the highest caliber. Be empathetic, professional, and non-judgmental.
    `;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: this.model,
        contents: userMessage,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
          temperature: this.settings.creativityLevel ?? 0.5,
        },
      });

      let text = response.text;
      if (!text) throw new Error("Empty response from AI");
      
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        text = text.substring(firstBrace, lastBrace + 1);
      } else {
        throw new Error("لم يتم العثور على استجابة صالحة.");
      }
      
      const aiResult = JSON.parse(text);
      
      // VERIFICATION LAYER: Fetch actual Quranic text from verified API
      const verifiedVerses: Verse[] = await Promise.all(
        (aiResult.verseMappings || []).map(async (mapping: any) => {
          try {
            const [arabicText, surahName] = await Promise.all([
              QuranDataService.fetchVerifiedVerse(mapping.surahNumber, mapping.ayahNumber),
              QuranDataService.fetchSurahName(mapping.surahNumber)
            ]);
            
            return {
              text: arabicText, // Required by Verse interface
              arabicText,
              surah: surahName, // Required by Verse interface
              surahName,
              number: mapping.ayahNumber, // Required by Verse interface
              surahNumber: mapping.surahNumber,
              ayahNumber: mapping.ayahNumber,
              tafsir: mapping.tafsir,
              tadabbur: mapping.tadabbur,
            };
          } catch (e) {
            console.error(`Failed to verify verse ${mapping.surahNumber}:${mapping.ayahNumber}`, e);
            // Fallback if API fails, though we prefer verification
            return null;
          }
        })
      ).then(results => results.filter(v => v !== null) as Verse[]);

      return {
        title: aiResult.title,
        introMessage: aiResult.introMessage,
        verses: verifiedVerses,
        tafakkur: aiResult.tafakkur,
        summary: aiResult.summary
      };

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}
