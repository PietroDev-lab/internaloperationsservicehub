import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
const randomUUID = (): string => {
  const bytes = new Uint8Array(16);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
};

export type RequestStatus = 'Received' | 'In Progress' | 'Pending' | 'Delayed' | 'Accepted' | 'Rejected' | 'Resolved' | 'Closed';

const VALID_STATUSES: RequestStatus[] = [
  'Received', 'In Progress', 'Pending', 'Delayed', 'Accepted', 'Rejected', 'Resolved', 'Closed'
];

export interface ServiceRequest {
  request_id: string;
  employee_id: string;
  type: string;
  description: string;
  status: RequestStatus;
  created_at: Date;
  updated_at: Date;
}

export interface RequestHistoryLog {
  log_id: string;
  request_id: string;
  changed_by_id: string;
  old_status: RequestStatus | null;
  new_status: RequestStatus;
  hr_response_message: string | null;
  timestamp: Date;
}

@Injectable()
export class RequestsService {
  private requests: ServiceRequest[] = [];
  private historyLogs: RequestHistoryLog[] = [];

  create(type: string, description: string) {
    const req: ServiceRequest = {
      request_id: randomUUID(),
      employee_id: 'EMP-HARDCODED', // Constraint: Hardcoded employee_id for now
      type,
      description,
      status: 'Received',
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.requests.push(req);

    // Enforce history invariant on creation
    const log: RequestHistoryLog = {
      log_id: randomUUID(),
      request_id: req.request_id,
      changed_by_id: 'SYSTEM', // Initial state
      old_status: null,
      new_status: 'Received',
      hr_response_message: null,
      timestamp: new Date(),
    };
    this.historyLogs.push(log);

    return req;
  }

  findAll() {
    return this.requests;
  }

  findOne(id: string) {
    const req = this.requests.find(r => r.request_id === id);
    if (!req) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }
    return req;
  }

  getHistory(id: string) {
    // Ensure request exists
    this.findOne(id);
    return this.historyLogs
      .filter(log => log.request_id === id)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  updateStatus(id: string, newStatus: RequestStatus, hrMessage?: string) {
    if (!VALID_STATUSES.includes(newStatus)) {
      throw new BadRequestException(`Invalid status value: ${newStatus}`);
    }

    const req = this.findOne(id);
    const oldStatus = req.status;

    // Defect Fix: Prevent invalid transitions
    if (oldStatus === 'Resolved' && newStatus === 'Received') {
      throw new BadRequestException('Cannot transition a Resolved request back to Received');
    }

    if (oldStatus === 'Received' && newStatus === 'Resolved') {
      throw new BadRequestException('Cannot transition a fresh Received request directly to Resolved without intermediate states');
    }

    req.status = newStatus;
    req.updated_at = new Date();

    // Enforce append-only history invariant
    const log: RequestHistoryLog = {
      log_id: randomUUID(),
      request_id: req.request_id,
      changed_by_id: 'HR-1',
      old_status: oldStatus,
      new_status: newStatus,
      hr_response_message: hrMessage || null,
      timestamp: new Date(),
    };
    this.historyLogs.push(log);

    return req;
  }
}
