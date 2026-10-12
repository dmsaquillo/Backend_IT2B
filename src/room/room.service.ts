import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class RoomService {
  constructor(
    private readonly db: DatabaseService,
  ) {}

  private pool = () => this.db.getPool();

  async createRoom(
    room_number: string,
    room_type_id: number,
    floor_number: number,
    room_status: string = 'AVAILABLE',
  ) {
    const [result] = await this.pool().execute<OkPacket>(
      `INSERT INTO room
      (
        room_number,
        room_type_id,
        floor_number,
        room_status
      )
      VALUES (?, ?, ?, ?)`,
      [
        room_number,
        room_type_id,
        floor_number,
        room_status,
      ],
    );

    return {
      room_id: result.insertId,
      room_number,
      room_type_id,
      floor_number,
      room_status,
    };
  }

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT *
       FROM room
       WHERE room_id = ?`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(
        `Room ${id} not found`,
      );
    }

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT *
       FROM room
       ORDER BY room_id DESC`,
    );

    return rows;
  }

  async updateRoom(
    id: number,
    partial: {
      room_number?: string;
      room_type_id?: number;
      floor_number?: number;
      room_status?: string;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.room_number !== undefined) {
      fields.push('room_number = ?');
      values.push(partial.room_number);
    }

    if (partial.room_type_id !== undefined) {
      fields.push('room_type_id = ?');
      values.push(partial.room_type_id);
    }

    if (partial.floor_number !== undefined) {
      fields.push('floor_number = ?');
      values.push(partial.floor_number);
    }

    if (partial.room_status !== undefined) {
      fields.push('room_status = ?');
      values.push(partial.room_status);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const sql = `
      UPDATE room
      SET ${fields.join(', ')}
      WHERE room_id = ?
    `;

    const [result] = await this.pool().execute<OkPacket>(
      sql,
      values,
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(
        `Room ${id} not found`,
      );
    }

    return this.findById(id);
  }

  async deleteRoom(id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      `DELETE FROM room
       WHERE room_id = ?`,
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(
        `Room ${id} not found`,
      );
    }

    return {
      message: `Room ${id} deleted successfully`,
    };
  }
}