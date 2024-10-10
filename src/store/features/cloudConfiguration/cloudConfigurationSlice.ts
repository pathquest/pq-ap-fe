import { createSlice } from "@reduxjs/toolkit"


interface FilesState {
    selectedConnecterId: any
}

const initialState: FilesState = {
    selectedConnecterId:null
}

export const cloudConfigurationSlice = createSlice({
    name: 'cloudConfigurationSlice',
    initialState,
    reducers: {
        setSelectedConnectorId: (state, action) => {
            state.selectedConnecterId = action.payload
        }
    },
})

export const { setSelectedConnectorId } = cloudConfigurationSlice.actions