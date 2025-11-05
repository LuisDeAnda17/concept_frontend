import axios, { type AxiosInstance, type AxiosResponse } from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

import type {
  // BrontoBoard API types
  InitializeBBRequest,
  InitializeBBResponse,
  CreateClassRequest,
  CreateClassResponse,
  AddWorkRequest,
  AddWorkResponse,
  ChangeWorkRequest,
  AddOHRequest,
  AddOHResponse,
  ChangeOHRequest,
  // BrontoCalendar API types
  CreateCalendarRequest,
  CreateCalendarResponse,
  CreateAssignmentRequest,
  CreateAssignmentResponse,
  AssignWorkRequest,
  CreateOfficeHoursRequest,
  CreateOfficeHoursResponse,
  AssignOHRequest,
  ChangeOHCalendarRequest,
  // UserAuthentication API types
  RegisterRequest,
  RegisterResponse,
  AuthenticateRequest,
  AuthenticateResponse,
  // Data types
  Assignment,
  OfficeHours,
  Class,
  BrontoBoard,
  Calendar,
} from "../types/api";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      // baseURL: "/api",
      baseURL: API_BASE,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config: any) => {
        // Inject session id into every POST body if present
        try {
          const sessionId =
            typeof window !== "undefined"
              ? window.localStorage.getItem("sessionId")
              : null;
          if (sessionId && config.method?.toLowerCase() === "post") {
            const originalData =
              config.data && typeof config.data === "object" ? config.data : {};
            config.data = { ...originalData, session: sessionId };
          }
        } catch (_) {
          // no-op if localStorage is unavailable
        }
        console.log(
          `Making ${config.method?.toUpperCase()} request to ${config.url}`
        );
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // BrontoBoard API Methods
  async initializeBB(data: InitializeBBRequest): Promise<InitializeBBResponse> {
    const response: AxiosResponse<InitializeBBResponse> = await this.api.post(
      "/BrontoBoard/initializeBB",
      data
    );
    return response.data;
  }

  async createClass(data: CreateClassRequest): Promise<CreateClassResponse> {
    const response: AxiosResponse<CreateClassResponse> = await this.api.post(
      "/BrontoBoard/createClass",
      data
    );
    return response.data;
  }

  async addWork(data: AddWorkRequest): Promise<AddWorkResponse> {
    const response: AxiosResponse<AddWorkResponse> = await this.api.post(
      "/BrontoBoard/addWork",
      data
    );
    return response.data;
  }

  async changeWork(data: ChangeWorkRequest): Promise<void> {
    await this.api.post("/BrontoBoard/changeWork", data);
  }

  async removeWork(owner: string, work: string): Promise<void> {
    await this.api.post("/BrontoBoard/removeWork", { owner, work });
  }

  async addOH(data: AddOHRequest): Promise<AddOHResponse> {
    const response: AxiosResponse<AddOHResponse> = await this.api.post(
      "/BrontoBoard/addOH",
      data
    );
    return response.data;
  }

  async changeOH(data: ChangeOHRequest): Promise<void> {
    await this.api.post("/BrontoBoard/changeOH", data);
  }

  async getAssignmentsForClass(classId: string): Promise<Assignment[]> {
    const response: AxiosResponse<Assignment[]> = await this.api.post(
      "/BrontoBoard/getAssignmentsForClass",
      { class: classId }
    );
    return response.data;
  }

  async getOfficeHoursForClass(classId: string): Promise<OfficeHours[]> {
    const response: AxiosResponse<OfficeHours[]> = await this.api.post(
      "/BrontoBoard/getOfficeHoursForClass",
      { class: classId }
    );
    return response.data;
  }

  async getClassesForBrontoBoard(brontoBoardId: string): Promise<Class[]> {
    const response: AxiosResponse<Class[]> = await this.api.post(
      "/BrontoBoard/getClassesForBrontoBoard",
      { brontoBoard: brontoBoardId }
    );
    return response.data;
  }

  async getBrontoBoardsForUser(userId: string): Promise<BrontoBoard[]> {
    const response: AxiosResponse<BrontoBoard[]> = await this.api.post(
      "/BrontoBoard/getBrontoBoardsForUser",
      { user: userId }
    );
    return response.data;
  }

  // BrontoCalendar API Methods
  async createCalendar(
    data: CreateCalendarRequest
  ): Promise<CreateCalendarResponse> {
    const response: AxiosResponse<CreateCalendarResponse> = await this.api.post(
      "/BrontoCalendar/createCalendar",
      data
    );
    return response.data;
  }

  async getCalendarForUser(userId: string): Promise<Calendar[]> {

    // const response: AxiosResponse<Calendar[]> = await this.api.post(
    //   "/BrontoCalendar/_getCalendarForUser",
    //   { user: userId }
    // );
    // return response.data;
    try {
      const response: AxiosResponse<Calendar[] | Calendar | null> =
        await this.api.post("/BrontoCalendar/_getCalendarForUser", {
          user: userId,
        });

      // Handle different response formats
      if (!response.data) {
        console.warn("getCalendarForUser: Response data is null/undefined");
        return [];
      }

      // If response.data is already an array, return it
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // If response.data is a single object, wrap it in an array
      if (typeof response.data === "object" && "_id" in response.data) {
        console.log(
          "getCalendarForUser: Received single object, wrapping in array"
        );
        return [response.data as Calendar];
      }

      // Fallback to empty array
      console.warn(
        "getCalendarForUser: Unexpected response format:",
        response.data
      );
      return [];
    } catch (error: any) {
      console.error("getCalendarForUser error:", error);
      // If it's a 404 or not found error, return empty array instead of throwing
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  async createAssignment(
    data: CreateAssignmentRequest
  ): Promise<CreateAssignmentResponse> {
    const response: AxiosResponse<CreateAssignmentResponse> =
      await this.api.post("/BrontoCalendar/createAssignment", data);
    return response.data;
  }

  async assignWork(data: AssignWorkRequest): Promise<void> {
    await this.api.post("/BrontoCalendar/assignWork", data);
  }

  async removeWorkFromCalendar(
    owner: string,
    assignmentId: string
  ): Promise<void> {
    await this.api.post("/BrontoCalendar/removeWork", { owner, assignmentId });
  }

  async updateAssignmentDueDate(
    owner: string,
    assignmentId: string,
    newDueDate: string
  ): Promise<void> {
    await this.api.post("/BrontoCalendar/updateAssignmentDueDate", {
      owner,
      assignmentId,
      newDueDate,
    });
  }

  async deleteAssignment(assignmentId: string): Promise<void> {
    await this.api.post("/BrontoCalendar/deleteAssignment", { assignmentId });
  }

  async createOfficeHours(
    data: CreateOfficeHoursRequest
  ): Promise<CreateOfficeHoursResponse> {
    const response: AxiosResponse<CreateOfficeHoursResponse> =
      await this.api.post("/BrontoCalendar/createOfficeHours", data);
    return response.data;
  }

  async assignOH(data: AssignOHRequest): Promise<void> {
    await this.api.post("/BrontoCalendar/assignOH", data);
  }

  async changeOHCalendar(data: ChangeOHCalendarRequest): Promise<void> {
    await this.api.post("/BrontoCalendar/changeOH", data);
  }

  async deleteOfficeHours(officeHoursId: string): Promise<void> {
    await this.api.post("/BrontoCalendar/deleteOfficeHours", { officeHoursId });
  }

  async getAssignmentsOnDay(
    calendarId: string,
    date: string
  ): Promise<Assignment[]> {
    const response: AxiosResponse<Assignment[]> = await this.api.post(
      "/BrontoCalendar/_getAssignmentsOnDay",
      { calendarId, date }
    );
    return response.data;
  }

  async getOfficeHoursOnDay(
    calendarId: string,
    date: string
  ): Promise<OfficeHours[]> {
    const response: AxiosResponse<OfficeHours[]> = await this.api.post(
      "/BrontoCalendar/_getOfficeHoursOnDay",
      { calendarId, date }
    );
    return response.data;
  }

  async getAssignment(assignmentId: string): Promise<Assignment[]> {
    const response: AxiosResponse<Assignment[]> = await this.api.post(
      "/BrontoCalendar/_getAssignment",
      { assignmentId }
    );
    return response.data;
  }

  async getOfficeHours(officeHoursId: string): Promise<OfficeHours[]> {
    const response: AxiosResponse<OfficeHours[]> = await this.api.post(
      "/BrontoCalendar/_getOfficeHours",
      { officeHoursId }
    );
    return response.data;
  }

  // UserAuthentication API Methods
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response: AxiosResponse<RegisterResponse> = await this.api.post(
      "/UserAuthentication/register",
      data
    );
    return response.data;
  }

  async authenticate(data: AuthenticateRequest): Promise<AuthenticateResponse> {
    const response: AxiosResponse<AuthenticateResponse> = await this.api.post(
      "/UserAuthentication/authenticate",
      data
    );
    return response.data;
  }

  // Sessioning API Methods
  async createSession(userId: string): Promise<{ session: string }> {
    const response: AxiosResponse<{ session: string }> = await this.api.post(
      "/Sessioning/create",
      { user: userId }
    );
    return response.data;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.api.post("/Sessioning/delete", { session: sessionId });
  }

  async getUserForSession(sessionId: string): Promise<Array<{ user: string }>> {
    const response: AxiosResponse<Array<{ user: string }>> =
      await this.api.post("/Sessioning/_getUser", { session: sessionId });
    return response.data;
  }
}

export const apiService = new ApiService();
