import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks'; 
import { fetchEmployerDetailById, clearEmployerDetail } from './slice';

export const useEmployerDetail = () => {
    const dispatch = useAppDispatch();
    const { id } = useParams<{ id: string }>();
    

    const { profile, jobs, loading, error } = useAppSelector((state: any) => state.employerDetail);

    useEffect(() => {
        if (id) {
            dispatch(fetchEmployerDetailById(id));
        }

        return () => {
            dispatch(clearEmployerDetail());
        };
    }, [dispatch, id]);

    return { profile, jobs, loading, error };
};