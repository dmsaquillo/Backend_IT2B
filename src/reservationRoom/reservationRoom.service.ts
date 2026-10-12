import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class ReservationRoomService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  // CREATE
  async createReservationRoom(
    reservation_id: number,
    room_id: number,
    assigned_rate: number,
    room_status: string = 'ASSIGNED',
  ) {
    const [result] = await this.pool().execute<OkPacket>(
      `INSERT INTO reservation_room
      (
        reservation_id,
        room_id,
        assigned_rate,
        room_status
      )
      VALUES (?, ?, ?, ?)`,
      [
        reservation_id,
        room_id,
        assigned_rate,
        room_status,
      ],
    );

    return {
      reservation_id,
      room_id,
      assigned_rate,
      room_status,
    };
  }

  // GET ONE
  async findById(
    reservation_id: number,
    room_id: number,
  ) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT *
       FROM reservation_room
       WHERE reservation_id = ?
       AND room_id = ?`,
      [reservation_id, room_id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(
        'Reservation room assignment not found',
      );
    }

    return rows[0];
  }

  // GET ALL
  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT *
       FROM reservation_room
       ORDER BY reservation_id DESC`,
    );

    return rows;
  }

  // UPDATE
  async updateReservationRoom(
    reservation_id: number,
    room_id: number,
    partial: {
      assigned_rate?: number;
      room_status?: string;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.assigned_rate !== undefined) {
      fields.push('assigned_rate = ?');
      values.push(partial.assigned_rate);
    }

    if (partial.room_status !== undefined) {
      fields.push('room_status = ?');
      values.push(partial.room_status);
    }

    if (fields.length === 0) {
      return this.findById(
        reservation_id,
        room_id,
      );
    }

    values.push(reservation_id);
    values.push(room_id);

    const sql = `
      UPDATE reservation_room
      SET ${fields.join(', ')}
      WHERE reservation_id = ?
      AND room_id = ?
    `;

    const [result] = await this.pool().execute<OkPacket>(
      sql,
      values,
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(
        'Reservation room assignment not found',
      );
    }

    return this.findById(
      reservation_id,
      room_id,
    );
  }

  // DELETE
  async deleteReservationRoom(
    reservation_id: number,
    room_id: number,
  ) {
    const [result] = await this.pool().execute<OkPacket>(
      `DELETE FROM reservation_room
       WHERE reservation_id = ?
       AND room_id = ?`,
      [reservation_id, room_id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(
        'Reservation room assignment not found',
      );
    }

    return {
      message: `Reservation room for reservation ${reservation_id} and room ${room_id} deleted successfully`,
      reservation_id,
      room_id,
    };
  }
}
