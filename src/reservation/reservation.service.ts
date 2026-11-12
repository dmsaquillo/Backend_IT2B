
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class ReservationService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

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

  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT *
       FROM reservation
       WHERE reservation_id = ?`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Reservation ${id} not found`);
    }

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT *
       FROM reservation
       ORDER BY reservation_id DESC`,
    );

    return rows;
  }

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

    const [result] = await this.pool().execute<OkPacket>(sql, values);

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Reservation ${id} not found`);
    }

    return this.findById(id);
  }

  async deleteReservation(id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      `DELETE FROM reservation
       WHERE reservation_id = ?`,
      [id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Reservation ${id} not found`);
    }

    return {
      message: `Reservation ${id} deleted successfully`,
    };
  }

  private readonly BOOKED_ROOMS = `
    SELECT rr.room_id
    FROM reservation_room rr
    JOIN reservation res ON res.reservation_id = rr.reservation_id
    WHERE res.reservation_status IN ('PENDING', 'CONFIRMED')
      AND res.check_in_date < ? AND res.check_out_date > ?`;

  private readonly PROMOS: Record<string, { pct: number; minNights: number }> = {
    STAY3: { pct: 20, minNights: 3 },
    WELCOME10: { pct: 10, minNights: 1 },
    GETAWAY15: { pct: 15, minNights: 2 },
  };

  private nightsBetween(a: string, b: string) {
    return Math.round(
      (new Date(b).getTime() - new Date(a).getTime()) / 86400000,
    );
  }

  private mapRoomType(r: any) {
    return {
      roomTypeId: r.roomTypeId,
      typeName: r.typeName,
      description: r.description,
      capacity: Number(r.capacity),
      nightlyRate: Number(r.nightlyRate),
      availableRooms:
        r.availableRooms !== undefined
          ? Number(r.availableRooms)
          : undefined,
    };
  }

  async listRoomTypes() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT room_type_id AS roomTypeId,
              type_name AS typeName,
              description,
              capacity,
              nightly_rate AS nightlyRate
       FROM room_type
       ORDER BY nightly_rate`,
    );

    return rows.map((r) => this.mapRoomType(r));
  }

  async availableRoomTypes(
    checkIn: string,
    checkOut: string,
    guests: number,
  ) {
    if (
      !checkIn ||
      !checkOut ||
      this.nightsBetween(checkIn, checkOut) <= 0
    ) {
      throw new BadRequestException('Invalid dates');
    }

    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT rt.room_type_id AS roomTypeId,
              rt.type_name AS typeName,
              rt.description,
              rt.capacity,
              rt.nightly_rate AS nightlyRate,
              COUNT(r.room_id) AS availableRooms
       FROM room_type rt
       JOIN room r
         ON r.room_type_id = rt.room_type_id
        AND r.room_status = 'AVAILABLE'
       WHERE rt.capacity >= ?
         AND r.room_id NOT IN (${this.BOOKED_ROOMS})
       GROUP BY
         rt.room_type_id,
         rt.type_name,
         rt.description,
         rt.capacity,
         rt.nightly_rate
       ORDER BY rt.nightly_rate`,
      [guests, checkOut, checkIn],
    );

    return rows.map((r) => this.mapRoomType(r));
  }

  async book(userId: number, b: any) {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      idNumber,
      specialRequest,
      roomTypeId,
      checkIn,
      checkOut,
      numberOfGuests,
      promoCode,
    } = b;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !roomTypeId ||
      !checkIn ||
      !checkOut ||
      !numberOfGuests
    ) {
      throw new BadRequestException(
        'Please fill in all required fields',
      );
    }

    const nights = this.nightsBetween(checkIn, checkOut);

    if (nights <= 0) {
      throw new BadRequestException(
        'Check-out must be after check-in',
      );
    }

    const conn = await this.pool().getConnection();

    try {
      await conn.beginTransaction();

      const [rt] = await conn.execute<RowDataPacket[]>(
        'SELECT * FROM room_type WHERE room_type_id = ?',
        [roomTypeId],
      );

      if (rt.length === 0) {
        throw new NotFoundException('Room type not found');
      }

      if (Number(numberOfGuests) > Number(rt[0].capacity)) {
        throw new BadRequestException(
          `This room fits up to ${rt[0].capacity} guests`,
        );
      }

      const [free] = await conn.execute<RowDataPacket[]>(
        `SELECT r.room_id
         FROM room r
         WHERE r.room_type_id = ?
           AND r.room_status = 'AVAILABLE'
           AND r.room_id NOT IN (${this.BOOKED_ROOMS})
         LIMIT 1
         FOR UPDATE`,
        [roomTypeId, checkOut, checkIn],
      );

      if (free.length === 0) {
        throw new ConflictException(
          'Sorry, no rooms of this type are free for those dates',
        );
      }

      const promo = promoCode
        ? this.PROMOS[String(promoCode).toUpperCase()]
        : undefined;

      const pct =
        promo && nights >= promo.minNights ? promo.pct : 0;

      const assignedRate =
        (Number(rt[0].nightly_rate) * (100 - pct)) / 100;

      const [g] = await conn.execute<OkPacket>(
        `INSERT INTO guests
         (first_name, last_name, email, phone, address, identification_number)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          firstName,
          lastName,
          email,
          phone,
          address || null,
          idNumber || null,
        ],
      );

      const [r] = await conn.execute<OkPacket>(
        `INSERT INTO reservation
         (guests_id, users_id, check_in_date, check_out_date,
          number_of_guests, special_request)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          g.insertId,
          userId,
          checkIn,
          checkOut,
          numberOfGuests,
          specialRequest || null,
        ],
      );

      await conn.execute(
        `INSERT INTO reservation_room
         (reservation_id, room_id, assigned_rate)
         VALUES (?, ?, ?)`,
        [r.insertId, free[0].room_id, assignedRate],
      );

      await conn.commit();

      return {
        reservationId: r.insertId,
        status: 'PENDING',
        nights,
        total: assignedRate * nights,
      };
    } catch (err: any) {
      await conn.rollback();

      if (err?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'That ID number is already registered to another guest',
        );
      }

      throw err;
    } finally {
      conn.release();
    }
  }

  async myReservations(userId: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT
         r.reservation_id,
         DATE_FORMAT(r.check_in_date, '%Y-%m-%d') AS check_in,
         DATE_FORMAT(r.check_out_date, '%Y-%m-%d') AS check_out,
         r.number_of_guests,
         r.reservation_status,
         r.special_request,
         rm.room_number,
         rt.type_name,
         rr.assigned_rate,
         (
           SELECT p.payment_status
           FROM payments p
           WHERE p.reservation_id = r.reservation_id
           ORDER BY p.payment_id DESC
           LIMIT 1
         ) AS payment_status
       FROM reservation r
       LEFT JOIN reservation_room rr
         ON rr.reservation_id = r.reservation_id
       LEFT JOIN room rm
         ON rm.room_id = rr.room_id
       LEFT JOIN room_type rt
         ON rt.room_type_id = rm.room_type_id
       WHERE r.users_id = ?
       ORDER BY r.reservation_id DESC`,
      [userId],
    );

    const byId = new Map<number, any>();

    for (const row of rows) {
      if (!byId.has(row.reservation_id)) {
        byId.set(row.reservation_id, {
          reservationId: row.reservation_id,
          checkInDate: row.check_in,
          checkOutDate: row.check_out,
          numberOfGuests: row.number_of_guests,
          status: row.reservation_status,
          specialRequest: row.special_request,
          paymentStatus: row.payment_status || 'UNPAID',
          totalAmount: 0,
          rooms: [],
        });
      }

      const booking = byId.get(row.reservation_id);

      if (row.room_number) {
        const rate = Number(row.assigned_rate);

        booking.rooms.push({
          roomNumber: row.room_number,
          typeName: row.type_name,
          assignedRate: rate,
        });

        booking.totalAmount +=
          rate *
          this.nightsBetween(
            booking.checkInDate,
            booking.checkOutDate,
          );
      }
    }

    return [...byId.values()];
  }

  async cancel(userId: number, id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      `UPDATE reservation
       SET reservation_status = 'CANCELLED'
       WHERE reservation_id = ?
         AND users_id = ?
         AND reservation_status IN ('PENDING', 'CONFIRMED')`,
      [id, userId],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(
        'Reservation not found or cannot be cancelled',
      );
    }

    return { message: 'Reservation cancelled' };
  }
}
