import { createSlice } from "@reduxjs/toolkit";
import { appActions } from "app/app.reducer";
import { authAPI, LoginParamsType } from "features/auth/auth.api";
import { clearTasksAndTodolists } from "common/actions";
import { createAppAsyncThunk, handleServerAppError, handleServerNetworkError } from "common/utils";
import {thunkTryCatch} from "../../common/utils/thunk-try-catch";

const slice = createSlice({
    name: "auth",
    initialState: {
        isLoggedIn: false,
    },
    reducers: {
        // setIsLoggedIn: (state, action: PayloadAction<{ isLoggedIn: boolean }>) => {
        //     state.isLoggedIn = action.payload.isLoggedIn;
        // },
    },
    extraReducers: (builder) => {
        builder.addCase(login.fulfilled, (state, action) => {
            state.isLoggedIn = action.payload.isLoggedIn;
        })
            .addCase(logout.fulfilled, (state, action) => {
            // state.isLoggedIn = action.payload.isLoggedIn
            state.isLoggedIn = false;
        })
            .addCase(initializeApp.fulfilled, (state, action) => {
                state.isLoggedIn = action.payload.isLoggedIn;
            })
    },
});

// thunks
const login = createAppAsyncThunk<{ isLoggedIn: boolean }, LoginParamsType>(
  `${slice.name}/login`,
  async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    try {
      dispatch(appActions.setAppStatus({ status: "loading" }));
      const res = await authAPI.login(arg);
      if (res.data.resultCode === 0) {
        dispatch(appActions.setAppStatus({ status: "succeeded" }));
        return { isLoggedIn: true };
      } else {
        const isShowAppError = !res.data.fieldsErrors.length
        handleServerAppError(res.data, dispatch, isShowAppError);
        return rejectWithValue(res.data);
      }
    } catch (e) {
      handleServerNetworkError(e, dispatch);
      return rejectWithValue(null);
    }
  },
);

const logout = createAppAsyncThunk<any>(
    `${slice.name}/logout`,
    async (arg, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI;
        try {
            dispatch(appActions.setAppStatus({status: "loading"}));
            const res = await authAPI.logout()
            if (res.data.resultCode === 0) {
                // dispatch(authActions.setIsLoggedIn({isLoggedIn: false}));
                dispatch(clearTasksAndTodolists());
                dispatch(appActions.setAppStatus({status: "succeeded"}));
                // return { isLoggedIn: false };
            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null);
            }
        } catch (e) {
            handleServerNetworkError(e, dispatch);
            return rejectWithValue(null)
        }
    }
);


// export const logoutTC = (): AppThunk => (dispatch) => {
//     dispatch(appActions.setAppStatus({ status: "loading" }));
//     authAPI
//         .logout()
//         .then((res) => {
//             if (res.data.resultCode === 0) {
//                 dispatch(authActions.setIsLoggedIn({ isLoggedIn: false }));
//                 dispatch(clearTasksAndTodolists());
//                 dispatch(appActions.setAppStatus({ status: "succeeded" }));
//             } else {
//                 handleServerAppError(res.data, dispatch);
//             }
//         })
//         .catch((error) => {
//             handleServerNetworkError(error, dispatch);
//         });
// };


// const initializeApp = createAppAsyncThunk<{ isLoggedIn: boolean }, undefined>(
//     `${slice.name}/initializeApp`,
//     async (_, thunkAPI) => {
//         const { dispatch, rejectWithValue } = thunkAPI;
//         try {
//             const res = await authAPI.me();
//             if (res.data.resultCode === 0) {
//                 return { isLoggedIn: true };
//             } else {
//                 // ❗ Нужна ли здесь обработки ошибки ?
//                 // Нет. Т.к. пользователь при первом обращении к приложению
//                 // будет видеть ошибку, что не логично
//                 handleServerAppError(res.data, dispatch, false);
//                 return rejectWithValue(null);
//             }
//         } catch (e) {
//             handleServerNetworkError(e, dispatch);
//             return rejectWithValue(null);
//         } finally {
//             //❗Нам не важно как прошел запрос, в любом случе мы должны сказать,
//             // что приложение проинициализировано
//             dispatch(appActions.setAppInitialized({ isInitialized: true }));
//         }
//     }
// );


const initializeApp = createAppAsyncThunk<{ isLoggedIn: boolean }, undefined>(
    `${slice.name}/initializeApp`,
    async (_, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI;
        return thunkTryCatch(thunkAPI, async () => {
            const res = await authAPI.me();
            if (res.data.resultCode === 0) {
                return {isLoggedIn: true};
            } else {
                // ❗ Нужна ли здесь обработки ошибки ?
                // Нет. Т.к. пользователь при первом обращении к приложению
                // будет видеть ошибку, что не логично
                return rejectWithValue(null);
            }
        }).finally(() => {
            //❗Нам не важно как прошел запрос, в любом случе мы должны сказать,
            // что приложение проинициализировано
            dispatch(appActions.setAppInitialized({isInitialized: true}));
        })
    })



export const authReducer = slice.reducer;
export const authActions = slice.actions;
export const authThunks = { login, logout, initializeApp };
