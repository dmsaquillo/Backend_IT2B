import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class ReservationService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  // CREATE
  async createReservation(
    guests_id: number,
    users_id: number,
    check_in_date: string,
    check_out_date: string,
    number_of_guests: number,
    reservation_status: string = 'PENDING',
    special_request?: string,
  ) {
    const [result] = await this.pool().execute<OkPacket>(
      `INSERT INTO reservation
      (
        guests_id,
        users_id,
        check_in_date,
        check_out_date,
        number_of_guests,
        reservation_status,
        special_request
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        guests_id,
        users_id,
        check_in_date,
        check_out_date,
        number_of_guests,
        reservation_status,
        special_request || null,
      ],
    );

    return {
      reservation_id: result.insertId,
      guests_id,
      users_id,
      check_in_date,
      check_out_date,
      number_of_guests,
      reservation_status,
      special_request: special_request || null,
    };
  }

  // GET ONE
  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT *
       FROM reservation
       WHERE reservation_id = ?`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(
        `Reservation ${id} not found`,
      );
    }

    return rows[0];
  }

  // GET ALL
  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT *
       FROM reservation
       ORDER BY reservation_id DESC`,
    );

    return rows;
  }

  // UPDATE
  async updateReservation(
    id: number,
    partial: {
      guests_id?: number;
      users_id?: number;
      check_in_date?: string;
      check_out_date?: string;
      number_of_guests?: number;
      reservation_status?: string;
      special_request?: string;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.guests_id !== undefined) {
      fields.push('guests_id = ?');
      values.push(partial.guests_id);
    }

    if (partial.users_id !== undefined) {
      fields.push('users_id = ?');
      values.push(partial.users_id);
    }

    if (partial.check_in_date !== undefined) {
      fields.push('check_in_date = ?');
      values.push(partial.check_in_date);
    }

    if (partial.check_out_date !== undefined) {
      fields.push('check_out_date = ?');
      values.push(partial.check_out_date);
    }

    if (partial.number_of_guests !== undefined) {
      fields.push('number_of_guests = ?');
      values.push(partial.number_of_guests);
    }

    if (partial.reservation_status !== undefined) {
      fields.push('reservation_status = ?');
      values.push(partial.reservation_status);
    }

    if (partial.special_request !== undefined) {
      fields.push('special_request = ?');
      values.push(partial.special_request);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const sql = `
      UPDATE reservation
      SET ${fields.join(', ')}
      WHERE reservation_id = ?
    `;

    const [result] = await this.pool().execute<OkPacket>(
      sql,
      values,
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(
        `Reservation ${id} not found`,
      );
    }

    return this.findById(id);
  }

  // DELETE
  async deleteReservation(id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      `DELETE FROM reservation
       WHERE reservation_id = ?`,
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(
        `Reservation ${id} not found`,
      );
    }

    return {
      message: `Reservation ${id} deleted successfully`,
    };
  }
}