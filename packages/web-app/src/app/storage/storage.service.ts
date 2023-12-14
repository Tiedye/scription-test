import { Injectable } from '@angular/core';
import { openDB } from 'idb';

import { Task } from '@take-home/shared';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private dbName = 'take-home';
  private dbVersion = 1;
  private tasks = 'tasks';

  constructor() {
    this.restoreIndexedDB();
    // this.resetIndexedDB();
  }

  async addTask(item: Task) {
    const db = await openDB(`${this.dbName}`, this.dbVersion);
    await db.add(this.tasks, item, item.uuid);
  }

  async updateTask(item: Task) {
    const db = await openDB(`${this.dbName}`, this.dbVersion);
    await db.put(this.tasks, item, item.uuid);
  }

  async getTask(id: string | null): Promise<Task> {
    const db = await openDB(`${this.dbName}`, this.dbVersion);
    return db.get(this.tasks, id ? id : '');
  }

  async getTasks(): Promise<Task[]> {
    const db = await openDB(`${this.dbName}`, this.dbVersion);
    return db.getAll(this.tasks);
  }

  private async resetIndexedDB() {
    await this.clearTasks();
    this.restoreIndexedDB();
  }

  private async clearTasks() {
    const db = await openDB(`${this.dbName}`, this.dbVersion);
    return db.clear(this.tasks);
  }

  private restoreIndexedDB(tasks = `${this.tasks}`) {
    openDB(`${this.dbName}`, this.dbVersion, {
      upgrade(db) {
        db.createObjectStore(tasks).createIndex('uuid', 'uuid', {
          unique: true,
        });
      },
    });
  }
}
