import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class GuestsService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  async createGuest(
  first_name: string,
  last_name: string,
  email: string,
  phone: number,
  address: string,
  identification_number: string,
) {
  const [result] = await this.pool().execute<OkPacket>(
    `INSERT INTO guests
    (first_name, last_name, email, phone, address, identification_number)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      first_name,
      last_name,
      email,
      phone,
      address,
      identification_number,
    ],
  );

  return {
    guests_id: result.insertId,
    first_name,
    last_name,
    email,
    phone,
    address,
    identification_number,
  };
}
  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT
        guests_id,
        first_name,
        last_name,
        email,
        phone,
        address,
        identification_number
       FROM guests
       WHERE guests_id = ?`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Guest ${id} not found`);
    }

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT
        guests_id,
        first_name,
        last_name,
        email,
        phone,
        address,
        identification_number
       FROM guests`,
    );

    return rows;
  }

  async updateGuest(
    id: number,
    partial: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: number;
      address?: string;
      identification_number?: string;
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

    if (partial.address !== undefined) {
      fields.push('address = ?');
      values.push(partial.address);
    }

    if (partial.identification_number !== undefined) {
      fields.push('identification_number = ?');
      values.push(partial.identification_number);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const sql = `
      UPDATE guests
      SET ${fields.join(', ')}
      WHERE guests_id = ?
    `;

    await this.pool().execute(sql, values);

    return this.findById(id);
  }

  async deleteGuest(id: string) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM guests WHERE guests_id = ?',
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Guest ${id} not found`);
    }

    return {
      message: `Guest ${id} deleted successfully`,
    };
  }
}