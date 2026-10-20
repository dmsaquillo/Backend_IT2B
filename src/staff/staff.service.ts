import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class StaffService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createStaff(
  first_name: string,
  last_name: string,
  email: string,
  phone: number,
  position: string,
  staff_status: string,
) {
  const [result] = await this.pool().execute<OkPacket>(
    `INSERT INTO staff
    (staff_id, 
    first_name, 
    last_name, 
    email, 
    phone, 
    position, 
    staff_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      first_name,
      last_name,
      email,
      phone,
      position,
      staff_status,
    ],
  );

  return {
    staff_id: result.insertId,
    first_name,
    last_name,
    email,
    phone,
    position,
    staff_status,
  };
}
  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT
        staff_id,
        first_name,
        last_name,
        email,
        phone,
        position,
        staff_status
       FROM staff
       WHERE staff_id = ?`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Staff member ${id} not found`);
    }

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT
        staff_id,
        first_name,
        last_name,
        email,
        phone,
        position,
        staff_status
       FROM staff`,
    );

    return rows;
  }

  async updateStaff(
    id: number,
    partial: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: number;
      position?: string;
      staff_status?: string;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.first_name !== undefined) {
      fields.push('first_name = ?');
      values.push(partial.first_name);
    }

    if (partial.last_name !== undefined) {
      fields.push('last_name = ?');
      values.push(partial.last_name);
    }

    if (partial.email !== undefined) {
      fields.push('email = ?');
      values.push(partial.email);
    }

    if (partial.phone !== undefined) {
      fields.push('phone = ?');
      values.push(partial.phone);
    }

    if (partial.position !== undefined) {
      fields.push('position = ?');
      values.push(partial.position);
    }

    if (partial.staff_status !== undefined) {
      fields.push('staff_status = ?');
      values.push(partial.staff_status);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const sql = `
      UPDATE staff
      SET ${fields.join(', ')}
      WHERE staff_id = ?
    `;

    await this.pool().execute(sql, values);

    return this.findById(id);
  }

  async deleteStaff(id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM staff WHERE staff_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Staff member ${id} not found`);
    }

    return {
      message: `Staff member ${id} deleted successfully`,
    };
  }
}