import { AppDispatch, AppRootStateType } from 'app/store';
import { handleServerNetworkError } from 'common/utils/handle-server-network-error';
import { BaseThunkAPI } from '@reduxjs/toolkit/dist/createAsyncThunk';
import { appActions } from 'app/app.reducer';
import { BaseResponseType} from 'common/types';


/*
This handles asynchronous logic with error handling using the provided thunkAPI
functions. It sets the application status to "loading" before executing the logic,
catches any errors that may occur, handles server network errors if needed, and sets
the application status back to "idle" after completion. The function returns a promise
that resolves with the result of the logic function or rejects with a null value using
 */
export const thunkTryCatch = async <T>(
    thunkAPI: BaseThunkAPI<AppRootStateType, unknown, AppDispatch, null | BaseResponseType>,
    logic: () => Promise<T>
): Promise<T | ReturnType<typeof thunkAPI.rejectWithValue>> => {
    const { dispatch, rejectWithValue } = thunkAPI;
    dispatch(appActions.setAppStatus({ status: "loading" }));
    try {
        return await logic();
    } catch (e) {
        handleServerNetworkError(e, dispatch);
        return rejectWithValue(null);
    } finally {
        dispatch(appActions.setAppStatus({ status: "idle" }));
    }
};