import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Employer, EmployerFilter } from '../types';
import { getEmployers } from '../services/service';

interface EmployerState {
  allEmployers: Employer[];
  totalRecords: number; 
  currentPage: number;  
  pageSize: number;       
  loading: boolean;
  error: string | null;
  filters: EmployerFilter;
}

const initialState: EmployerState = {
  allEmployers: [],
  totalRecords: 0,
  currentPage: 1,
  pageSize: 10,
  loading: false,
  error: null,
  filters: {
    page: 1,
    pageSize: 10
  },
};

export const fetchEmployers = createAsyncThunk<{ employers: Employer[], totalRecords: number }, EmployerFilter>(
  'employers/fetchEmployers',
  async (filters) => {
    const response = await getEmployers(filters);
    return response;
  }
);

const employerSlice = createSlice({
  name: 'employers',
  initialState,
  reducers: {
    setEmployerFilters(state, action: PayloadAction<EmployerFilter>) {
        state.filters = { ...state.filters, ...action.payload };
        if (action.payload.page) {
            state.currentPage = action.payload.page;
        }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployers.fulfilled, (state, action) => {
        state.loading = false;
        state.allEmployers = action.payload.employers;
        state.totalRecords = action.payload.totalRecords; 
      })
      .addCase(fetchEmployers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi tải danh sách nhà tuyển dụng';
        state.allEmployers = [];
        state.totalRecords = 0;
      });
  },
});

export const { setEmployerFilters } = employerSlice.actions;
export default employerSlice.reducer;
