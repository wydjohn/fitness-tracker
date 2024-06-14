import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import YourComponent from './YourComponent';

jest.mock('axios');

const { REACT_APP_API_BASE_URL } = process.env;

describe('<YourComponent />', () => {
  
  it('renders the component', () => {
    render(<YourComponent />);
    expect(screen.getByTestId('your-component')).toBeInTheDocument();
  });

  it('updates on user input', async () => {
    render(<YourComponent />);
    const inputField = screen.getByTestId('input-field');
    
    fireEvent.change(inputField, { target: { value: 'new value' } });

    expect(inputField.value).toBe('new value');
  });

  it('displays data correctly', async () => {
    const mockedData = { data: [{ id: 1, name: 'Test Data' }] };
    axios.get.mockResolvedValue(mockedData);

    await act(async () => {
      render(<YourComponent apiUrl={`${REACT_APP_API_BASE_URL}/data-endpoint`} />);
    });

    expect(screen.getByTestId('data-visualization')).toHaveTextContent('Test Data');
  });

  it('synchronizes with real-time data', async () => {
    const initialData = { data: [{ id: 1, name: 'Initial Data' }] };
    const updatedData = { data: [{ id: 1, name: 'Updated Data' }] };

    axios.get.mockResolvedValueOnce(initialData);

    await act(async () => {
      render(<YourComponent apiUrl={`${REACT_APP_API_BASE_URL}/real-time-endpoint`} />);
    });

    expect(screen.getByTestId('data-display')).toHaveTextContent('Initial Data');

    axios.get.mockResolvedValueOnce(updatedData);

    fireEvent.click(screen.getByTestId('refresh-button'));

    await waitFor(() => {
      expect(screen.getByTestId('data-display')).toHaveTextContent('Updated Data');
    });
  });

});