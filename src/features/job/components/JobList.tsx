
import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';

const JobList: React.FC = () => {
  const jobs = useSelector((state: RootState) => state.jobs.jobs);

  return (
    <div>
      <h2>Job List</h2>
      <ul>
        {jobs.map(job => (
          <li key={job.id}>
            <h3>{job.title}</h3>
            <p>{job.company} - {job.location}</p>
            <p>{job.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobList;
