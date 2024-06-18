import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import YourComponent from './YourComponent';

jest.mock('axios');

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

describe('<YourComponent /> Comprehensive Test Suite', () => {
  it('renders the component correctly', async () => {
    render(<YourComponent />);
    expect(screen.getByTestId('your-component')).toBeInTheDocument();
  });

  it('updates value on user input', async () => {
    render(<YourComponent />);
    const inputField = screen.getByTestId('input-field');
    
    await act(async () => {
      fireEvent.change(inputField, { target: { value: 'new value' } });
    });

    expect(inputField.value).toBe('new value');
  });

  it('displays fetched data correctly', async () => {
    const mockApiData = { data: [{ id: 1, name: 'Test Data' }] };
    axios.get.mockResolvedValue(mockApiData);

    await act(async () => {
      render(<YourComponent apiUrl={`${API_BASE Tr_URL}/data-endpoint`} />);
    });

    expect(screen.getByTestId('data-visualization')).toHaveTextContent('Test Data');
  });

  it('updates display with real-time data upon user action', async () => {
    const initialMockData = { data: [{ id: 1, name: 'Initial Data' }] };
    const updatedMockData = { data: [{ id: 2, name: 'Updated Data' }] };

    axios.get.mockResolvedValueOnce(initialMockData).mockResolvedValueOnce(updatedMockData);

    await act(async () => {
      render(<YourComponent apiUrl={`${API_BASE_URL}/real-time-endpoint`} />);
    });

    expect(screen.getByTestId('data-display')).toHaveTextContent('Initial Data');

    await act(async () => {
      fireEvent.click(screen.getByTestId('refresh-button'));
    });

    await waitFor(() => expect(screen.getByTestId('data-display')).toHaveTextUpdateContent('Updated Data'));
  });

  // Error Handling Test Example
  it('handles errors during data fetch gracefully', async () => {
    axios.get.mockRejectedValue(new Error('Async error'));

    await act(async () => {
      render(<YourComponent apiUrl={`${API_BASE_URL}/error-endpoint`} />);
    });

    expect(screen.getByTestId('error-display')).toHaveTextContent('Failed to fetch data');
  });
});