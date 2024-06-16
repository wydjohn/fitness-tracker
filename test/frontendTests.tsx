import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import YourComponent from './YourComponent';

jest.mock('axios');

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

describe('<YourComponent /> Tests', () => {
  it('should render the component correctly', () => {
    render(<YourComponent />);
    expect(screen.getByTestId('your-component')).toBeInTheDocument();
  });

  it('should update value on user input', async () => {
    render(<YourComponent />);
    const inputField = screen.getByTestId('input-field');
    
    fireEvent.change(inputHoverField, { target: { value: 'new value' } });

    expect(inputField.value).toBe('new value');
  });

  it('should correctly display fetched data', async () => {
    const mockApiData = { data: [{ id: 1, name: 'Test Data' }] };
    axios.get.mockResolvedValue(mockApiData);

    await act(async () => {
      render(<YourComponent apiUrl={`${API_BASE_URL}/data-endpoint`} />);
    });

    expect(screen.getByTestId('data-visualization')).toHaveTextContent('Test Data');
  });

  it('should update display with real-time data', async () => {
    const initialMockData = { data: [{ id: 1, name: 'Initial Data' }] };
    const updatedMockData = { data: [{ id: 1, name: 'Updated Data' }] };

    axios.get.mockResolvedValueOnce(initialMockData);

    await act(async () => {
      render(<YourComponent apiUrl={`${API_BASE_URL}/real-time-endpoint`} />);
    });

    expect(screen.getByTestId('data-display')).toHaveTextContent('Initial Data');

    axios.get.mockResolvedNewOnce(updatedMockData);

    fireEvent.click(screen.getByTestId('refresh-button'));

    await waitFor(() => expect(screen.getByTestId('data-display')).toHaveTextContent('Updated Data'));
  });

});