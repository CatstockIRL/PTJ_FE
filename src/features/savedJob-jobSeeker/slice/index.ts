import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { SavedJob } from '../types';
import { getSavedJobs, unsaveJob } from '../services';

interface SavedJobsState {
  jobs: SavedJob[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  total: number;
}


const initialState: SavedJobsState = {
  jobs: [],
  status: 'idle',
  error: null,
  total: 0,
};


export const fetchSavedJobs = createAsyncThunk('savedJobs/fetchSavedJobs', async () => {
  const response = await getSavedJobs();
  return response;
});


export const removeSavedJob = createAsyncThunk('savedJobs/removeSavedJob', async (jobId: string, { rejectWithValue }) => {
  try {
    await unsaveJob(jobId);
    return jobId;
  } catch (error) {
    return rejectWithValue('Failed to unsave job.');
  }
});

const savedJobsSlice = createSlice({
  name: 'savedJobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavedJobs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSavedJobs.fulfilled, (state, action: PayloadAction<{ jobs: SavedJob[]; total: number }>) => {
        state.status = 'succeeded';
        state.jobs = action.payload.jobs;
        state.total = action.payload.total;
      })
      .addCase(fetchSavedJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch saved jobs.';
      })
      .addCase(removeSavedJob.fulfilled, (state, action: PayloadAction<string>) => {
        state.jobs = state.jobs.filter((job) => job.id !== action.payload);
      });
  },
});

export default savedJobsSlice.reducer;
