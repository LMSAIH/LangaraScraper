export interface SavedSchedule {
  id: string;
  name: string;
  sections: any[]; 
  term: string;
  createdAt: string;
  updatedAt: string;
}

export class ScheduleStorage {
  private static STORAGE_KEY = 'langara_saved_schedules';

  static getAllSchedules(): SavedSchedule[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading saved schedules:', error);
      return [];
    }
  }

  static saveSchedule(name: string, sections: any[], term: string): SavedSchedule {
    const schedules = this.getAllSchedules();
    const now = new Date().toISOString();
    
    const newSchedule: SavedSchedule = {
      id: Date.now().toString(),
      name,
      sections,
      term,
      createdAt: now,
      updatedAt: now
    };

    schedules.push(newSchedule);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(schedules));
    
    return newSchedule;
  }

  static updateSchedule(id: string, name: string, sections: any[], term: string): SavedSchedule | null {
    const schedules = this.getAllSchedules();
    const index = schedules.findIndex(s => s.id === id);
    
    if (index === -1) return null;

    schedules[index] = {
      ...schedules[index],
      name,
      sections,
      term,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(schedules));
    return schedules[index];
  }

  static deleteSchedule(id: string): boolean {
    const schedules = this.getAllSchedules();
    const filtered = schedules.filter(s => s.id !== id);
    
    if (filtered.length === schedules.length) return false;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  static loadSchedule(id: string): SavedSchedule | null {
    const schedules = this.getAllSchedules();
    return schedules.find(s => s.id === id) || null;
  }

  static exportSchedules(): string {
    return JSON.stringify(this.getAllSchedules(), null, 2);
  }

  static importSchedules(data: string): boolean {
    try {
      const schedules = JSON.parse(data);
      if (Array.isArray(schedules)) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(schedules));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing schedules:', error);
      return false;
    }
  }
}
