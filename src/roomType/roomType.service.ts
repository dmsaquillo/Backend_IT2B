import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class RoomTypeService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createRoomType(
  room_type_id: string,
 type_name: string,
  description: string,
  capacity: number,
  nightly_rate: string,
  room_type_status: string,
  staff_status:string,
) {
  const [result] = await this.pool().execute<OkPacket>(
    `INSERT INTO room_types
    (room_type_id, 
    type_name, 
    description, 
    capacity, 
    nightly_rate, 
    room_type_status, 
    staff_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      room_type_id,
      type_name,
      description,
      capacity,
      nightly_rate,
      room_type_status,
      staff_status,
    ],
  );

  return {
    room_type_id: result.insertId,
    type_name,
    description,
    capacity,
    nightly_rate,
    room_type_status,
    staff_status,
  };
}
  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT
        room_type_id,
        type_name,
        description,
        capacity,
        nightly_rate,
        room_type_status,
        staff_status
       FROM room_types
       WHERE room_type_id = ?`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Room type ${id} not found`);
    }

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT
        room_type_id,
        type_name,
        description,
        capacity,
        nightly_rate,
        room_type_status,
        staff_status
       FROM room_types`,
    );

    return rows;
  }

  async updateRoomType(
    id: number,
    partial: {
      type_name?: string;
      description?: string;
      capacity?: number;
      nightly_rate?: string;
      room_type_status?: string;
      staff_status?: string;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.type_name !== undefined) {
      fields.push('type_name = ?');
      values.push(partial.type_name);
    }

    if (partial.description !== undefined) {
      fields.push('description = ?');
      values.push(partial.description);
    }

    if (partial.capacity !== undefined) {
      fields.push('capacity = ?');
      values.push(partial.capacity);
    }

    if (partial.nightly_rate !== undefined) {
      fields.push('nightly_rate = ?');
      values.push(partial.nightly_rate);
    }

    if (partial.room_type_status !== undefined) {
      fields.push('room_type_status = ?');
      values.push(partial.room_type_status);
    }

    if (partial.staff_status !== undefined) {
      fields.push('staff_status = ?');
      values.push(partial.staff_status);
    }

    const sql = `
      UPDATE room_types
      SET ${fields.join(', ')}
      WHERE room_type_id = ?
    `;

    await this.pool().execute(sql, values);

    return this.findById(id);
  }

  async deleteRoomType(id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM room_types WHERE room_type_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Room type ${id} not found`);
    }

    return {
      message: `Room type ${id} deleted successfully`,
    };
  }
}