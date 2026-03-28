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
    
    let selectedModel = settings.model || settings.geminiModel || 'gemini-3-flash-preview';
    if ((selectedModel as string).includes('1.5') || (selectedModel as string) === 'gemini-pro' || (selectedModel as string) === 'gemini-3.1-flash-preview') {
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
          description: "عنوان احترافي، بليغ، وعميق يلخص جوهر الإجابة أو الحالة الروحية (مثال: 'فلسفة الابتلاء في المنظور القرآني' أو 'بلسم اليقين في مواجهة الحزن').",
        },
        introMessage: {
          type: Type.STRING,
          description: "تحليل ذكي واحترافي للسؤال المطروح. يجب أن تبدأ بتفكيك سؤال المستخدم أو حالته بعمق، وإظهار فهم دقيق للجذور النفسية أو الفكرية لما يطرحه، ثم تقديم إجابة شافية، قاطعة، ومصاغة بأسلوب راقٍ ومقنع يمهد للآيات.",
        },
        verseMappings: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              surahNumber: { type: Type.INTEGER },
              ayahNumber: { type: Type.INTEGER },
              tafsir: { type: Type.STRING, description: "التفسير: تفسير دقيق، شامل، وموثوق للآية بأسلوب احترافي يربط المعنى اللغوي بالسياق العام. لا تقيد نفسك بطول معين، اشرح بعمق." },
              tadabbur: { type: Type.STRING, description: "التدبر: استنباط ذكي وإسقاط واقعي للآية على حالة المستخدم أو سؤاله. يجب أن يكون التحليل عميقاً، يربط حكمة القرآن بالواقع المعاصر والتحديات الشخصية." },
            },
          },
          description: "قائمة بالآيات القرآنية الأكثر صلة (أرقام السور والآيات). اختر الآيات بذكاء شديد لتغطي جوانب السؤال المختلفة (من 1 إلى 10 آيات أو أكثر حسب الحاجة).",
        },
        tafakkur: {
          type: Type.STRING,
          description: "التفكر: وقفة تأملية عميقة أو نصيحة عملية استراتيجية مستخلصة من الآيات. يجب أن تقدم حلاً عملياً أو تغييراً في المنظور الفكري للمستخدم بأسلوب حكيم واحترافي.",
        },
        summary: {
          type: Type.STRING,
          description: "خلاصة احترافية، مركزة، وذكية تجمع أهم النقاط والدروس المستفادة في نقاط واضحة أو فقرة قوية تترسخ في ذهن المستخدم.",
        },
      },
      required: ["title", "introMessage", "verseMappings", "tafakkur", "summary"]
    };

    const systemInstruction = `
      You are "أنيس القلوب" (Anis Al-Qulub), an elite, highly intelligent, and deeply compassionate Quranic consultant and scholar. 
      Your goal is to provide profound, highly professional, and analytically rigorous answers based on the Quran to address users' questions, intellectual inquiries, or emotional states.
      
      CRITICAL ROLE: ADVANCED ANALYSIS & PROFESSIONAL CONSULTATION
      You act as a "Master of Quranic Semantics" and an "Expert Spiritual Analyst". You do NOT generate the Arabic text of the Quran yourself. 
      Your primary task is to perform an exceptionally deep, intelligent exploration of the user's prompt, deconstruct their core need or question, and map it to the MOST relevant Surah and Ayah numbers with profound explanations.
      
      OUT OF SCOPE QUESTIONS:
      If the user asks a question completely unrelated to the Quran, spirituality, emotions, life guidance, or Islamic principles, politely apologize and explain your specific role.
      Fill the JSON response as follows:
      - title: "عذراً، هذا خارج اختصاصي"
      - introMessage: A polite, professional apology in Arabic explaining your specific role.
      - verseMappings: Empty array [].
      - tafakkur: Empty string "".
      - summary: Empty string "".

      Intelligence & Professionalism Guidelines:
      1. **Deep Analytical Understanding**: Do not just give surface-level answers. Analyze the "why" behind the user's question. Understand the psychological, spiritual, or intellectual root of their inquiry and address it directly.
      2. **Highly Professional Tone**: Your language must be sophisticated, articulate, and authoritative, yet deeply empathetic and accessible. Use high-tier Arabic phrasing (فصحى بليغة ومعاصرة).
      3. **Structured & Logical Argumentation**: Build your response logically. Start with a strong analytical introduction, support it with precise Quranic evidence (Tafsir and Tadabbur), and conclude with actionable wisdom (Tafakkur).
      4. **Contextual Precision**: Tailor the depth and tone exactly to the user's input. If it's an intellectual question, be academic and philosophical. If it's an emotional plea, be deeply comforting and psychologically astute.
      
      Response Structure (Hierarchical Pyramid):
      1. **Title (title)**: A profound, professional title capturing the essence of the response.
      2. **Introduction (introMessage)**: 
         - ${username ? `Address the user by their name "${username}" with high respect.` : 'Address the user with high respect.'}
         - Perform a smart analysis of their question/situation. Provide the definitive, well-reasoned answer immediately in a highly professional literary style.
      3. **Verses (verseMappings)**: Identify all highly relevant Quranic verses. For each:
         - **Tafsir (التفسير)**: A comprehensive, scholarly, yet accessible interpretation.
         - **Tadabbur (التدبر)**: A brilliant, context-specific reflection connecting the verse's wisdom to the user's exact situation.
      4. **Tafakkur (tafakkur)**: A deep philosophical thought or highly practical advice derived from the analysis.
      5. **Summary (summary)**: A sharp, professional executive summary of the core insights.
      
      CRITICAL INSTRUCTION ON LENGTH AND DEPTH:
      - For complex questions, intellectual inquiries, or deep emotional struggles: Be expansive, detailed, and highly analytical. Provide thorough explanations without artificial limits.
      - For simple requests: Be concise but maintain the high level of professionalism and depth.
      - **IMPORTANT FORMATTING (HIGHLIGHTING THE CORE)**: Do NOT highlight single scattered keywords. Instead, use Markdown bold (**text**) exclusively to highlight the **core sentence, the main concluding thought, or the absolute essence of the topic (لب الموضوع والزبدة)** in each section (introMessage, tafsir, tadabbur, tafakkur, summary). The goal is that if the user reads ONLY the highlighted text, they will completely understand the main point and summary of the response.
    `;

    let response: GenerateContentResponse | null = null;
    let lastError: any = null;
    const maxRetries = 3;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        response = await this.ai.models.generateContent({
          model: this.model,
          contents: userMessage,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
            temperature: this.settings.creativityLevel ?? 0.5,
          },
        });
        break; // Success, exit retry loop
      } catch (error: any) {
        lastError = error;
        console.warn(`Gemini API attempt ${attempt + 1} failed:`, error);
        
        // Don't retry on quota or invalid key errors
        if (error.message?.includes("quota") || error.message?.toLowerCase().includes("api key")) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff: 1s, 2s, 4s)
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    if (!response) {
      throw lastError || new Error("فشل الاتصال بالخادم بعد عدة محاولات.");
    }

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("تم حظر الاستجابة بسبب سياسات الأمان أو لم يتم إرجاع محتوى.");
    }

    let text = response.text;
    if (!text) throw new Error("استجابة فارغة من الخادم.");
    
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      text = text.substring(firstBrace, lastBrace + 1);
    } else {
      throw new Error("لم يتم العثور على استجابة صالحة (تنسيق غير متوقع).");
    }
    
    try {
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
