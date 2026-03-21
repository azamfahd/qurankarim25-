export class QuranDataService {
  static async fetchVerifiedVerse(surahNumber: number, ayahNumber: number): Promise<string> {
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}`);
      const data = await response.json();
      if (data.code === 200) {
        return data.data.text;
      }
      throw new Error("Failed to fetch verse");
    } catch (error) {
      console.error("Error fetching verse:", error);
      return "عذراً، تعذر جلب الآية.";
    }
  }

  static async fetchSurahName(surahNumber: number): Promise<string> {
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const data = await response.json();
      if (data.code === 200) {
        return data.data.name;
      }
      throw new Error("Failed to fetch surah name");
    } catch (error) {
      console.error("Error fetching surah name:", error);
      return `سورة ${surahNumber}`;
    }
  }
}
