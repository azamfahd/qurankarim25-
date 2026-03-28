export class QuranDataService {
  private static cache: Map<string, string> = new Map();
  private static surahCache: Map<number, string> = new Map();

  static async fetchVerifiedVerse(surahNumber: number, ayahNumber: number): Promise<string> {
    const cacheKey = `${surahNumber}:${ayahNumber}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}`);
      const data = await response.json();
      if (data.code === 200) {
        this.cache.set(cacheKey, data.data.text);
        return data.data.text;
      }
      throw new Error("Failed to fetch verse");
    } catch (error) {
      console.error("Error fetching verse:", error);
      return "عذراً، تعذر جلب الآية.";
    }
  }

  static async fetchSurahName(surahNumber: number): Promise<string> {
    if (this.surahCache.has(surahNumber)) {
      return this.surahCache.get(surahNumber)!;
    }

    try {
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const data = await response.json();
      if (data.code === 200) {
        this.surahCache.set(surahNumber, data.data.name);
        return data.data.name;
      }
      throw new Error("Failed to fetch surah name");
    } catch (error) {
      console.error("Error fetching surah name:", error);
      return `سورة ${surahNumber}`;
    }
  }
}
