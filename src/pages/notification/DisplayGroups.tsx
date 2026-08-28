import axios, { AxiosResponse } from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { all_group, all_user, CityInterestGroup, create_exel_group, create_group, delete_group, merge_group, profile_userIntrest, update_group, display_all_country, display_city_country } from '../../api/config';
import * as XLSX from 'xlsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import IconRefresh from '../../components/Icon/IconRefresh';
import IconInfoCircle from '../../components/Icon/IconInfoCircle';
import IconPencilPaper from '../../components/Icon/IconPencilPaper';
import IconMultipleForwardRight from '../../components/Icon/IconMultipleForwardRight';
import IconTrash from '../../components/Icon/IconTrash';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import DownloadIcon from '@mui/icons-material/Download';
import debounce from 'lodash.debounce';

// Types
interface DeviceToken {
  _id: string;
  token?: string;
  username?: string;
  email: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface RegularGroup {
  _id: string;
  groupName: string;
  userCount: number;
  users: DeviceToken[];
  createdAt?: string;
  updatedAt?: string;
  type: 'regular';
}

interface CityInterestGroup {
  _id: string;
  name: string;
  type: 'city' | 'interest';
  cities: string[];
  interests: { _id: string; name: string }[];
  createdAt?: string;
  updatedAt?: string;
  userCount: number;
  users: DeviceToken[];
}

type Group = RegularGroup | CityInterestGroup;

interface User {
  _id: string;
  username?: string;
  email?: string;
  phone?: string;
  location?: string;
  interests?: string[];
}

interface UserInterest {
  _id: string;
  name: string;
}

interface CreateGroupResponse {
  group: Group;
  message?: string;
}

interface UpdateGroupResponse {
  group: Group;
  message?: string;
}

interface CityOption {
  value: string;
  label: string;
}

interface CountryOption {
  value: string;
  label: string;
  country: string;
}

// Utility Functions
const formatGroupNo = (index: number, currentPage: number, groupsPerPage: number): string =>
  String((currentPage - 1) * groupsPerPage + index + 1).padStart(3, '0');

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? 'Invalid Date'
    : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
};

// Function to get group name based on type with fallback
const getGroupName = (group: Group): string => {
  if (!group) return 'Unnamed Group';
  const name = group.type === 'regular' ? (group as RegularGroup).groupName : (group as CityInterestGroup).name;
  return name || 'Unnamed Group';
};

// Components
interface MultiSelectProps<T> {
  options: T[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  getOptionId: (option: T) => string;
  getOptionLabel: (option: T) => string;
  placeholder?: string;
}

const MultiSelect = <T,>({
  options,
  selected,
  onSelectionChange,
  getOptionId,
  getOptionLabel,
  placeholder = 'Select items...',
}: MultiSelectProps<T>) => {
  const handleToggle = (id: string) => {
    onSelectionChange(
      selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id]
    );
  };

  return (
    <div className="space-y-2 border border-gray-200 rounded-lg p-2 max-h-40 overflow-y-auto bg-white">
      {options.length === 0 ? (
        <p className="text-gray-500">{placeholder}</p>
      ) : (
        options.map((option) => (
          <div key={getOptionId(option)} className="flex items-center space-x-2 p-1 hover:bg-gray-100">
            <input
              type="checkbox"
              id={getOptionId(option)}
              checked={selected.includes(getOptionId(option))}
              onChange={() => handleToggle(getOptionId(option))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={getOptionId(option)} className="cursor-pointer text-gray-700 flex-1">
              {getOptionLabel(option)}
            </label>
          </div>
        ))
      )}
    </div>
  );
};

interface SingleSelectProps<T> {
  options: T[];
  selected: string;
  onSelectionChange: (selected: string) => void;
  getOptionId: (option: T) => string;
  getOptionLabel: (option: T) => string;
  placeholder?: string;
  searchTerm?: string;
}

const SingleSelect = <T,>({
  options,
  selected,
  onSelectionChange,
  getOptionId,
  getOptionLabel,
  placeholder = 'Select item...',
  searchTerm = '',
}: SingleSelectProps<T>) => {
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    return options.filter((option) =>
      getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, getOptionLabel]);

  const handleSelect = (id: string) => {
    onSelectionChange(id);
  };

  return (
    <div className="space-y-2 border border-gray-200 rounded-lg p-2 max-h-40 overflow-y-auto bg-white">
      {filteredOptions.length === 0 ? (
        <p className="text-gray-500">{placeholder}</p>
      ) : (
        filteredOptions.map((option) => (
          <div key={getOptionId(option)} className="flex items-center space-x-2 p-1 hover:bg-gray-100">
            <input
              type="radio"
              id={getOptionId(option)}
              checked={selected === getOptionId(option)}
              onChange={() => handleSelect(getOptionId(option))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={getOptionId(option)} className="cursor-pointer text-gray-700 flex-1">
              {getOptionLabel(option)}
            </label>
          </div>
        ))
      )}
    </div>
  );
};

const MultiCitySelect: React.FC<{
  selectedCities: string[];
  onSelectionChange: (cities: string[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}> = ({ selectedCities, onSelectionChange, searchTerm, setSearchTerm }) => {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(display_all_country);
        setCountries(response.data?.data || []);
      } catch (error) {
        console.error('Error fetching countries:', error);
        toast.error('Failed to fetch countries');
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedCountry) {
        setCities([]);
        return;
      }
      try {
        const response = await axios.get(`${display_city_country}/${selectedCountry}`);
        const cityData = Array.isArray(response.data?.data)
          ? response.data.data.map((city: string | CityOption) =>
            typeof city === 'string' ? { value: city, label: city } : city
          )
          : [];
        setCities(cityData);
      } catch (error) {
        console.error('Error fetching cities:', error);
        toast.error('Failed to fetch cities');
      }
    };
    fetchCities();
  }, [selectedCountry]);

  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) return cities;
    return cities.filter((city) =>
      city.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cities, searchTerm]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-700 font-medium mb-2">Select Country</label>
        <select
          value={selectedCountry}
          onChange={(e) => {
            setSelectedCountry(e.target.value);
            onSelectionChange([]); // Reset city selection when country changes
          }}
          className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          aria-label="Select country"
        >
          <option value="" disabled>
            Select a country
          </option>
          {countries.map((country) => (
            <option key={country.value} value={country.value}>
              {country.country}
            </option>
          ))}
        </select>
      </div>
      {selectedCountry && (
        <>
          <div>
            <input
              type="text"
              placeholder="Search cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search cities"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Select City</label>
            <SingleSelect
              options={filteredCities}
              selected={selectedCities[0] || ''}
              onSelectionChange={(cityId) => onSelectionChange([cityId])}
              getOptionId={(city) => city.value}
              getOptionLabel={(city) => city.label}
              placeholder={selectedCountry ? 'No cities available' : 'Select a country first'}
              searchTerm={searchTerm}
            />
          </div>
        </>
      )}
    </div>
  );
};

const SingleInterestSelect: React.FC<{
  selectedInterest: string;
  onSelectionChange: (interestId: string) => void;
  interests: UserInterest[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}> = ({ selectedInterest, onSelectionChange, interests, searchTerm, setSearchTerm }) => {
  const filteredInterests = useMemo(() => {
    if (!searchTerm.trim()) return interests;
    return interests.filter((interest) =>
      interest.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [interests, searchTerm]);

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Search interests..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Search interests"
      />
      <SingleSelect
        options={filteredInterests}
        selected={selectedInterest}
        onSelectionChange={onSelectionChange}
        getOptionId={(interest) => interest._id}
        getOptionLabel={(interest) => interest.name}
        placeholder="No interests available"
        searchTerm={searchTerm}
      />
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: string | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center bg-red-50 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>
          <p className="text-gray-600 mt-2">{this.state.error || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface UserInterestFormProps {
  onClose: () => void;
}

const UserInterestForm: React.FC<UserInterestFormProps> = ({ onClose }) => {
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [editInterest, setEditInterest] = useState<UserInterest | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInterests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(profile_userIntrest);
      setInterests(response.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch interests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterests();
  }, [fetchInterests]);

  const handleCreateInterest = async () => {
    if (!newInterest.trim()) {
      toast.error('Interest name is required');
      return;
    }
    setLoading(true);
    try {
      await axios.post(profile_userIntrest, { name: newInterest });
      setNewInterest('');
      fetchInterests();
      toast.success('Interest created successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create interest');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInterest = async () => {
    if (!editInterest || !editInterest.name.trim()) {
      toast.error('Interest name is required');
      return;
    }
    setLoading(true);
    try {
      await axios.patch(`${profile_userIntrest}/${editInterest._id}`, { name: editInterest.name });
      setEditInterest(null);
      fetchInterests();
      toast.success('Interest updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update interest');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInterest = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this interest?')) return;
    setLoading(true);
    try {
      await axios.delete(`${profile_userIntrest}/${id}`);
      fetchInterests();
      toast.success('Interest deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete interest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md transform transition-all duration-300 scale-95">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
          aria-label="Close modal"
        >
          ×
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Manage User Interests</h2>
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Add User Interest</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Enter interest"
              className="flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="New interest"
              disabled={loading}
            />
            <button
              onClick={handleCreateInterest}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              aria-label="Add interest"
              disabled={loading}
            >
              Add
            </button>
          </div>
        </div>
        {editInterest && (
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Edit Interest</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editInterest.name}
                onChange={(e) => setEditInterest({ ...editInterest, name: e.target.value })}
                className="flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Edit interest"
                disabled={loading}
              />
              <button
                onClick={handleUpdateInterest}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                aria-label="Save interest"
                disabled={loading}
              >
                Save
              </button>
              <button
                onClick={() => setEditInterest(null)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                aria-label="Cancel edit"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" aria-label="Loading"></div>
            </div>
          ) : interests.length === 0 ? (
            <p className="text-gray-500 text-center">No interests found</p>
          ) : (
            interests.map((interest) => (
              <div
                key={interest._id}
                className="flex items-center justify-between p-2 bg-white rounded-lg mb-2 hover:bg-gray-100"
              >
                <span className="text-gray-700">{interest.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditInterest(interest)}
                    className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
                    title="Edit interest"
                    aria-label={`Edit ${interest.name}`}
                    disabled={loading}
                  >
                    <IconPencilPaper />
                  </button>
                  <button
                    onClick={() => handleDeleteInterest(interest._id)}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    title="Delete interest"
                    aria-label={`Delete ${interest.name}`}
                    disabled={loading}
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface GroupState {
  groups: Group[];
  users: User[];
  interests: UserInterest[];
  searchTerm: string;
  groupTypeFilter: 'regular' | 'city' | 'interest';
  loading: boolean;
  error: string | null;
  success: string | null;
  currentPage: number;
  selectedGroupIds: string[];
}

interface FormData {
  newGroupName: string;
  createUserSearch: string;
  editUserSearch: string;
  googleSheetLink: string;
  selectedUserIds: string[];
  selectedGroupIds: string[];
  selectedCities: string[];
  selectedInterests: string[];
  createMethod: 'manual' | 'merge' | 'city' | 'interest';
  editGroupId: string | null;
  viewGroup: Group | null;
  uploadMethod: 'excel' | 'googleSheet' | null;
  mergeGroupSearch: string;
  interestSearch: string;
  citySearch: string;
}

const DisplayGroup: React.FC = () => {
  const [groupState, setGroupState] = useState<GroupState>({
    groups: [],
    users: [],
    interests: [],
    searchTerm: '',
    groupTypeFilter: 'regular',
    loading: true,
    error: null,
    success: null,
    currentPage: 1,
    selectedGroupIds: [],
  });

  const [modals, setModals] = useState({
    create: false,
    upload: false,
    userInterest: false,
    edit: false,
    view: false,
  });

  const [formData, setFormData] = useState<FormData>({
    newGroupName: '',
    createUserSearch: '',
    editUserSearch: '',
    googleSheetLink: '',
    selectedUserIds: [],
    selectedGroupIds: [],
    selectedCities: [],
    selectedInterests: [],
    createMethod: 'manual',
    editGroupId: null,
    viewGroup: null,
    uploadMethod: null,
    mergeGroupSearch: '',
    interestSearch: '',
    citySearch: '',
  });

  const navigate = useNavigate();
  const groupsPerPage = 10;

  const handleSearch = useCallback(
    debounce((value: string) => {
      setGroupState((prev) => ({ ...prev, searchTerm: value, currentPage: 1 }));
    }, 500), // Increased debounce for better performance
    []
  );

  const fetchData = useCallback(async () => {
    try {
      setGroupState((prev) => ({ ...prev, loading: true, error: null }));
      const [regularGroupResponse, cityInterestGroupResponse, userResponse, interestResponse] = await Promise.all([
        axios.get(all_group),
        axios.get(CityInterestGroup),
        axios.get(all_user),
        axios.get(profile_userIntrest),
      ]);

      const validRegularGroups: RegularGroup[] = (regularGroupResponse.data || []).filter(
        (group: any) =>
          group._id &&
          typeof group.groupName === 'string' && // Ensure groupName is string
          Array.isArray(group.users)
      ).map((group: any) => ({
        ...group,
        type: 'regular' as const,
        groupName: group.groupName || 'Unnamed Group', // Fallback
        userCount: group.userCount || group.users.length,
        createdAt: group.createdAt || new Date().toISOString(),
        updatedAt: group.updatedAt || new Date().toISOString(),
      }));

      const validCityInterestGroups: CityInterestGroup[] = (cityInterestGroupResponse.data || []).filter(
        (group: any) =>
          group._id &&
          typeof group.name === 'string' && // Ensure name is string
          (group.type === 'city' || group.type === 'interest')
      ).map((group: any) => ({
        ...group,
        name: group.name || 'Unnamed Group', // Fallback
        userCount: group.userCount || group.users?.length || 0,
        users: group.users || [],
        createdAt: group.createdAt || new Date().toISOString(),
        updatedAt: group.updatedAt || new Date().toISOString(),
      }));

      const validUsers: User[] = (userResponse.data?.data || []).filter(
        (user: any) => user._id && (user.username || user.email || user.phone)
      );

      const validInterests: UserInterest[] = (interestResponse.data || []).filter(
        (interest: any) => interest._id && typeof interest.name === 'string'
      );

      setGroupState((prev) => ({
        ...prev,
        groups: [...validRegularGroups, ...validCityInterestGroups],
        users: validUsers,
        interests: validInterests,
        loading: false,
      }));
    } catch (error) {
      setGroupState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load data',
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredGroups = useMemo(() => {
    const searchLower = groupState.searchTerm.toLowerCase();
    return groupState.groups.filter(
      (group) => {
        if (!group || !group.type) return false;
        return (
          getGroupName(group).toLowerCase().includes(searchLower) &&
          group.type === groupState.groupTypeFilter
        );
      }
    );
  }, [groupState.groups, groupState.searchTerm, groupState.groupTypeFilter]);

  const paginatedGroups = useMemo(() => {
    return filteredGroups.slice(
      (groupState.currentPage - 1) * groupsPerPage,
      groupState.currentPage * groupsPerPage
    );
  }, [filteredGroups, groupState.currentPage]);

  const totalPages = Math.ceil(filteredGroups.length / groupsPerPage);

  const filteredMergeGroups = useMemo(() => {
    const searchLower = formData.mergeGroupSearch.toLowerCase();
    return (groupState.groups || []).filter(
      (group) =>
        group &&
        group.type === 'regular' &&
        getGroupName(group).toLowerCase().includes(searchLower)
    );
  }, [groupState.groups, formData.mergeGroupSearch]);

  const filteredInterestsCreate = useMemo(() => {
    const searchLower = formData.interestSearch.toLowerCase();
    return groupState.interests.filter((interest) =>
      interest.name.toLowerCase().includes(searchLower)
    );
  }, [groupState.interests, formData.interestSearch]);

  const handleCheckboxChange = useCallback((id: string, type: 'user' | 'group') => {
    setFormData((prev) => ({
      ...prev,
      [type === 'user' ? 'selectedUserIds' : 'selectedGroupIds']: prev[
        type === 'user' ? 'selectedUserIds' : 'selectedGroupIds'
      ].includes(id)
        ? prev[type === 'user' ? 'selectedUserIds' : 'selectedGroupIds'].filter((i) => i !== id)
        : [...prev[type === 'user' ? 'selectedUserIds' : 'selectedGroupIds'], id],
    }));
  }, []);

  const handleSingleInterestChange = useCallback((id: string) => {
    setFormData((prev) => ({ ...prev, selectedInterests: [id] }));
  }, []);

  const handleSingleCityChange = useCallback((id: string) => {
    setFormData((prev) => ({ ...prev, selectedCities: [id] }));
  }, []);

  const [isCreating, setIsCreating] = useState(false); // Loading state for create

  const handleCreateGroup = useCallback(async () => {
    if (!formData.newGroupName.trim()) {
      toast.error('Group name is required');
      return;
    }
    setIsCreating(true);

    try {
      let response: AxiosResponse<CreateGroupResponse>;
      switch (formData.createMethod) {
        case 'manual':
          if (formData.selectedUserIds.length === 0) {
            toast.error('At least one user must be selected');
            return;
          }
          response = await axios.post<CreateGroupResponse>(create_group, {
            groupName: formData.newGroupName,
            deviceTokenId: formData.selectedUserIds,
            type: 'regular',
          });
          break;
        case 'merge':
          if (formData.selectedGroupIds.length < 2) {
            toast.error('At least two groups must be selected to merge');
            return;
          }
          response = await axios.post<CreateGroupResponse>(merge_group, {
            groupName: formData.newGroupName,
            groupIds: formData.selectedGroupIds,
            type: 'regular',
          });
          console.log("🚀 ~ DisplayGroup ~ response:", response)
          break;
        case 'city':
          if (formData.selectedCities.length !== 1) {
            toast.error('Exactly one city must be selected');
            return;
          }
          response = await axios.post<CreateGroupResponse>(CityInterestGroup, {
            name: formData.newGroupName, // Fixed: use 'name' instead of 'groupName'
            cities: formData.selectedCities,
            type: 'city',
          });
          break;
        case 'interest':
          if (formData.selectedInterests.length !== 1) {
            toast.error('Exactly one interest must be selected');
            return;
          }
          response = await axios.post<CreateGroupResponse>(CityInterestGroup, {
            name: formData.newGroupName, // Fixed: use 'name' instead of 'groupName'
            interests: formData.selectedInterests,
            type: 'interest',
          });
          break;
        default:
          throw new Error('Invalid creation method');
      }

      setGroupState((prev) => ({
        ...prev,
        groups: [...prev.groups, response.data.group],
        success: 'Group created successfully',
        error: null,
      }));

      resetForm();
      setModals((prev) => ({ ...prev, create: false }));
      setTimeout(() => {
        setGroupState((prev) => ({ ...prev, success: null }));
        fetchData();
      }, 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create group');
    } finally {
      setIsCreating(false);
    }
  }, [formData, groupState.groups, fetchData]);

  const resetForm = useCallback(() => {
    setFormData({
      newGroupName: '',
      createUserSearch: '',
      editUserSearch: '',
      googleSheetLink: '',
      selectedUserIds: [],
      selectedGroupIds: [],
      selectedCities: [],
      selectedInterests: [],
      createMethod: 'manual',
      editGroupId: null,
      viewGroup: null,
      uploadMethod: null,
      mergeGroupSearch: '',
      interestSearch: '',
      citySearch: '',
    });
  }, []);

  const handleRowSend = useCallback((group: Group) => {
    navigate('/group_notification', { state: { groupName: getGroupName(group), type: group.type } });
  }, [navigate]);

  const handleViewGroup = useCallback((group: Group) => {
    if (!Array.isArray(group.users)) {
      toast.error(`Cannot view group ${getGroupName(group)}: Invalid member data`);
      return;
    }
    setFormData((prev) => ({ ...prev, viewGroup: { ...group, users: group.users || [] } }));
    setModals((prev) => ({ ...prev, view: true }));
  }, []);

  const isCityInterestGroup = useCallback((group: Group): group is CityInterestGroup => {
    return group.type === 'city' || group.type === 'interest';
  }, []);

  const handleEditGroup = useCallback((groupId: string) => {
    const group = groupState.groups.find((g) => g._id === groupId);
    if (!group) {
      toast.error('Group not found');
      return;
    }

    const validInterests = isCityInterestGroup(group) && group.interests
      ? [group.interests[0]?._id || ''].filter((id): id is string => !!id)
      : [];
    const selectedCities = isCityInterestGroup(group) && group.cities
      ? [group.cities[0] || ''].filter((city): city is string => !!city)
      : [];

    setFormData((prev) => ({
      ...prev,
      editGroupId: groupId,
      newGroupName: getGroupName(group),
      selectedUserIds: group.type === 'regular' ? group.users.map((token) => token._id) : [],
      selectedCities,
      selectedInterests: validInterests,
      editUserSearch: '',
      citySearch: '',
      interestSearch: '',
    }));
    setModals((prev) => ({ ...prev, edit: true }));
  }, [groupState.groups, isCityInterestGroup]);

  const [isEditing, setIsEditing] = useState(false); // Loading state for edit

  const handleSaveEditGroup = useCallback(async () => {
    if (!formData.editGroupId || !formData.newGroupName.trim()) {
      toast.error('Group name is required');
      return;
    }
    setIsEditing(true);

    try {
      const currentGroup = groupState.groups.find((g) => g._id === formData.editGroupId);
      if (!currentGroup) {
        toast.error('Group not found');
        return;
      }

      let response: AxiosResponse<UpdateGroupResponse>;
      if (currentGroup.type === 'regular') {
        if (formData.selectedUserIds.length === 0) {
          toast.error('At least one user must be selected');
          return;
        }
        const currentUserIds = currentGroup.users.map((token) => token._id);
        response = await axios.patch<UpdateGroupResponse>(`${update_group}/${formData.editGroupId}`, {
          groupName: formData.newGroupName,
          addDeviceTokenIds: formData.selectedUserIds.filter((id) => !currentUserIds.includes(id)),
          removeDeviceTokenIds: currentUserIds.filter((id) => !formData.selectedUserIds.includes(id)),
        });
      } else {
        if (currentGroup.type === 'city' && formData.selectedCities.length !== 1) {
          toast.error('Exactly one city must be selected');
          return;
        }
        if (currentGroup.type === 'interest' && formData.selectedInterests.length !== 1) {
          toast.error('Exactly one interest must be selected');
          return;
        }
        response = await axios.patch<UpdateGroupResponse>(`${CityInterestGroup}/${formData.editGroupId}`, {
          name: formData.newGroupName,
          cities: formData.selectedCities,
          interests: formData.selectedInterests,
          type: currentGroup.type,
        });
      }

      setGroupState((prev) => ({
        ...prev,
        groups: prev.groups.map((group) => (group._id === formData.editGroupId ? response.data.group : group)),
        success: 'Group updated successfully',
        error: null,
      }));

      setModals((prev) => ({ ...prev, edit: false }));
      resetForm();
      setTimeout(() => setGroupState((prev) => ({ ...prev, success: null })), 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update group');
    } finally {
      setIsEditing(false);
    }
  }, [formData, groupState.groups, resetForm]);

  const handleDeleteGroup = useCallback(async (groupId: string) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    try {
      const group = groupState.groups.find((g) => g._id === groupId);
      await axios.delete(group?.type === 'regular' ? `${delete_group}/${groupId}` : `${CityInterestGroup}/${groupId}`);
      setGroupState((prev) => ({
        ...prev,
        groups: prev.groups.filter((g) => g._id !== groupId),
        success: 'Group deleted successfully',
        error: null,
        currentPage: Math.max(1, prev.currentPage - (prev.groups.length <= prev.currentPage * groupsPerPage ? 1 : 0)),
      }));
      setTimeout(() => setGroupState((prev) => ({ ...prev, success: null })), 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete group');
    }
  }, [groupState.groups]);

  const handleBulkDelete = useCallback(async () => {
    if (groupState.selectedGroupIds.length === 0) {
      toast.error('No groups selected for deletion');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${groupState.selectedGroupIds.length} groups?`)) return;
    try {
      await Promise.all(
        groupState.selectedGroupIds.map((groupId) => {
          const group = groupState.groups.find((g) => g._id === groupId);
          return axios.delete(group?.type === 'regular' ? `${delete_group}/${groupId}` : `${CityInterestGroup}/${groupId}`);
        })
      );
      setGroupState((prev) => ({
        ...prev,
        groups: prev.groups.filter((g) => !prev.selectedGroupIds.includes(g._id)),
        selectedGroupIds: [],
        success: 'Selected groups deleted successfully',
        error: null,
        currentPage: Math.max(1, prev.currentPage - (prev.groups.length <= prev.currentPage * groupsPerPage ? 1 : 0)),
      }));
      setTimeout(() => setGroupState((prev) => ({ ...prev, success: null })), 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete groups');
    }
  }, [groupState.selectedGroupIds, groupState.groups]);

  // const handleExcelUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) {
  //     toast.error('No file selected');
  //     return;
  //   }

  //   const groupName = file.name.split('.')[0];
  //   const reader = new FileReader();

  //   reader.onload = async (event) => {
  //     try {
  //       const data = new Uint8Array(event.target?.result as ArrayBuffer);
  //       const workbook = XLSX.read(data, { type: 'array' });
  //       const sheetName = workbook.SheetNames[0];
  //       const worksheet = workbook.Sheets[sheetName];
  //       const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);

  //       const users = jsonData
  //         .map((row) => ({
  //           email: row.email || row.Email || '',
  //           phone: row.phone || row.Phone || '',
  //         }))
  //         .filter((user) => user.email && user.phone);

  //       if (users.length === 0) {
  //         toast.error('No valid users found in the Excel file');
  //         return;
  //       }

  //       await axios.post(create_exel_group, { groupName, user: users });
  //       console.log("🚀 ~ DisplayGroup ~ groupName:", groupName)
  //       toast.success('Group created successfully from Excel');
  //       setModals((prev) => ({ ...prev, upload: false }));
  //       resetForm();
  //       setTimeout(() => fetchData(), 3000);
  //     } catch (error) {
  //       toast.error(error instanceof Error ? error.message : 'Failed to create group from Excel');
  //     }
  //   };

  //   reader.readAsArrayBuffer(file);
  // }, [resetForm, fetchData]);

  const [selectedExcelFile, setSelectedExcelFile] = useState<File | null>(null);

  const handleExcelUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    console.log("Selected file:", file);

    if (!file) {
      toast.error('No file selected');
      return;
    }

    console.log('File type:', file.type);
    console.log('File size (bytes):', file.size);
    console.log('File name:', file.name);

    setSelectedExcelFile(file);  // Save the file for later submission
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedExcelFile) {
      toast.error('Please select an Excel file first');
      return;
    }

    const groupName = selectedExcelFile.name.split('.')[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);

        console.log('File loaded into array buffer, size:', data.byteLength);

        const workbook = XLSX.read(data, { type: 'array' });

        console.log('Workbook Sheets:', workbook.SheetNames);

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);

        console.log('Parsed JSON Data:', jsonData);

        const users = jsonData
          .map((row) => {
            console.log("🚀 ~ DisplayGroup ~ row:", row)
            return ({
              email: row.email || row.Email || '',
              phone: row.phone || row.Phone || '',
            });
          })
          .filter((user) => {
            console.log("🚀 ~ DisplayGroup ~ user:", user)
            return user.email && user.phone;
          });

        console.log('Valid Users:', users.length);

        if (users.length === 0) {
          toast.error('No valid users found in the Excel file');
          return;
        }

        const res = await axios.post(create_exel_group, { groupName, user: users });
        console.log("🚀 ~ DisplayGroup ~ res:", res)

        toast.success('Group created successfully from Excel');
        setModals((prev) => ({ ...prev, upload: false }));
        resetForm();
        setTimeout(() => fetchData(), 3000);
      } catch (error) {
        console.error('Excel Upload Error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to create group from Excel');
      }
    };

    reader.readAsArrayBuffer(selectedExcelFile);
  }, [selectedExcelFile, resetForm, fetchData]);

  const handleGoogleSheetUpload = useCallback(async () => {
    if (!formData.googleSheetLink.trim()) {
      toast.error('Please provide a valid Google Sheet link');
      return;
    }

    const sheetIdMatch = formData.googleSheetLink.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) {
      toast.error('Invalid Google Sheet link format');
      return;
    }

    const sheetId = sheetIdMatch[1];
    const groupName = `Sheet_${sheetId.slice(0, 8)}`;

    try {
      await axios.post(create_group, {
        groupName,
        sheetUrl: formData.googleSheetLink,
        type: 'regular',
      });
      toast.success('Group created successfully from Google Sheet');
      setModals((prev) => ({ ...prev, upload: false }));
      resetForm();
      setTimeout(() => fetchData(), 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create group from Google Sheet');
    }
  }, [formData.googleSheetLink, resetForm, fetchData]);

  const handleExportGroups = useCallback(() => {
    const exportData = groupState.groups.map((group) => ({
      GroupName: getGroupName(group),
      Type: group.type,
      Members: group.userCount,
      CreatedAt: formatDate(group.createdAt || ''),
      Users: group.users.map((user) => user.email || user.phone || user.username || 'Unknown').join(', '),
      ...(isCityInterestGroup(group) ? {
        Cities: group.cities.join(', '),
        Interests: group.interests.map((i) => i.name).join(', '),
      } : {}),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Groups');
    XLSX.writeFile(workbook, `groups_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [groupState.groups]);

  const filteredCreateUsers = useMemo(() => {
    return groupState.users.filter((user) => {
      const searchLower = formData.createUserSearch.toLowerCase();
      return (
        !formData.createUserSearch.trim() ||
        (user.username || '').toLowerCase().includes(searchLower) ||
        (user.email || '').toLowerCase().includes(searchLower) ||
        (user.phone || '').toLowerCase().includes(searchLower)
      );
    });
  }, [groupState.users, formData.createUserSearch]);

  const filteredEditUsers = useMemo(() => {
    return groupState.users.filter((user) => {
      const searchLower = formData.editUserSearch.toLowerCase();
      return (
        !formData.editUserSearch.trim() ||
        (user.username || '').toLowerCase().includes(searchLower) ||
        (user.email || '').toLowerCase().includes(searchLower) ||
        (user.phone || '').toLowerCase().includes(searchLower)
      );
    });
  }, [groupState.users, formData.editUserSearch]);

  const currentGroup = useMemo(() =>
    formData.editGroupId
      ? groupState.groups.find((g) => g._id === formData.editGroupId)
      : null,
    [formData.editGroupId, groupState.groups]
  );

  if (groupState.loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" aria-label="Loading"></div>
      </div>
    );
  }
  const adminType = localStorage.getItem("adminType");
  return (
    <ErrorBoundary>
      <div className="p-0 md:p-6 bg-gray-50 min-h-screen">
        <ToastContainer position="top-right" autoClose={3000} />

        {adminType === "super admin" && (
          <ol className="flex space-x-2 text-gray-500 font-semibold dark:text-white-dark mb-6">
            <li>
              <Link to="/" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</Link>
            </li>
            <li>/</li>
            <li className="text-black dark:text-white-light">Group</li>
          </ol>
        )}
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Groups</h2>
        {groupState.error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
            {groupState.error}
          </div>
        )}
        {groupState.success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6">
            {groupState.success}
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search groups..."
              value={groupState.searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search groups"
            />
            <select
              value={groupState.groupTypeFilter}
              onChange={(e) =>
                setGroupState((prev) => ({
                  ...prev,
                  groupTypeFilter: e.target.value as 'regular' | 'city' | 'interest',
                  currentPage: 1,
                }))
              }
              className="border border-gray-300 p-2 rounded-lg w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter group type"
            >
              <option value="regular">Regular Groups</option>
              <option value="city">City Groups</option>
              <option value="interest">Interest Groups</option>
            </select>
            <button
              onClick={fetchData}
              className="p-2 text-gray-600 hover:text-blue-600"
              title="Refresh data"
              aria-label="Refresh data"
            >
              <IconRefresh className="w-6 h-6" />
            </button>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setModals((prev) => ({ ...prev, userInterest: true }))}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              aria-label="User interests"
            >
              <SupervisedUserCircleIcon /> User Interests
            </button>
            <button
              onClick={() => setModals((prev) => ({ ...prev, upload: true }))}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              aria-label="Upload group"
            >
              <UploadFileIcon /> Upload Group
            </button>
            <button
              onClick={() => setModals((prev) => ({ ...prev, create: true }))}
              className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              aria-label="Create group"
            >
              <AddIcon /> Create Group
            </button>
            {/* Uncomment if needed
            <button
              onClick={handleExportGroups}
              className="flex items-center gap-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              aria-label="Export groups"
            >
              <DownloadIcon /> Export
            </button>
            */}
            {groupState.selectedGroupIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                aria-label="Delete selected groups"
              >
                <IconTrash /> Delete Selected ({groupState.selectedGroupIds.length})
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left text-gray-700 font-semibold w-[5%]">
                  <input
                    type="checkbox"
                    checked={groupState.selectedGroupIds.length === paginatedGroups.length && paginatedGroups.length > 0}
                    onChange={() => {
                      setGroupState((prev) => ({
                        ...prev,
                        selectedGroupIds:
                          prev.selectedGroupIds.length === paginatedGroups.length
                            ? []
                            : paginatedGroups.map((group) => group._id),
                      }));
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label="Select all groups"
                  />
                </th>
                <th className="p-3 text-left text-gray-700 font-semibold w-[10%]">Group No</th>
                <th className="p-3 text-left text-gray-700 font-semibold w-[30%]">Group Name</th>
                <th className="p-3 text-left text-gray-700 font-semibold w-[15%]">Type</th>
                <th className="p-3 text-left text-gray-700 font-semibold w-[15%]">Members</th>
                <th className="p-3 text-left text-gray-700 font-semibold w-[20%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedGroups.length > 0 ? (
                paginatedGroups.map((group, index) => (
                  <tr key={group._id} className="hover:bg-gray-50 border-t border-gray-200">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={groupState.selectedGroupIds.includes(group._id)}
                        onChange={() =>
                          handleCheckboxChange(group._id, 'group')
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        aria-label={`Select ${getGroupName(group)}`}
                      />
                    </td>
                    <td className="p-3 text-gray-700">{formatGroupNo(index, groupState.currentPage, groupsPerPage)}</td>
                    <td className="p-3 font-medium text-gray-800">{getGroupName(group)}</td>
                    <td className="p-3 text-gray-700">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-sm ${group.type === 'city'
                          ? 'bg-blue-100 text-blue-700'
                          : group.type === 'interest'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {group.type.charAt(0).toUpperCase() + group.type.slice(1)}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700">{group.userCount}</td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewGroup(group)}
                          className="p-2 text-blue-500 hover:text-blue-700"
                          title="View group details"
                          aria-label={`View ${getGroupName(group)}`}
                        >
                          <IconInfoCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditGroup(group._id)}
                          className="p-2 text-blue-500 hover:text-blue-700"
                          title="Edit group"
                          aria-label={`Edit ${getGroupName(group)}`}
                        >
                          <IconPencilPaper className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleRowSend(group)}
                          disabled={!Array.isArray(group.users) || group.users.length === 0}
                          className={`p-2 ${!Array.isArray(group.users) || group.users.length === 0
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-yellow-500 hover:text-yellow-600'
                            }`}
                          title={!Array.isArray(group.users) || group.users.length === 0 ? 'No members to send' : 'Send notification'}
                          aria-label={`Send notification to ${getGroupName(group)}`}
                        >
                          <IconMultipleForwardRight className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group._id)}
                          className="p-2 text-red-500 hover:text-red-600"
                          title="Delete group"
                          aria-label={`Delete ${getGroupName(group)}`}
                        >
                          <IconTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    {groupState.searchTerm ? 'No groups match your search' : 'No groups found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setGroupState((prev) => ({ ...prev, currentPage: Math.max(prev.currentPage - 1, 1) }))}
              disabled={groupState.currentPage === 1}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="text-gray-700">Page {groupState.currentPage} of {totalPages}</span>
            <button
              onClick={() => setGroupState((prev) => ({ ...prev, currentPage: Math.min(prev.currentPage + 1, totalPages) }))}
              disabled={groupState.currentPage === totalPages}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        )}
        {modals.create && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <button
                onClick={() => {
                  setModals((prev) => ({ ...prev, create: false }));
                  resetForm();
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
                aria-label="Close create modal"
              >
                ×
              </button>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Create Group</h2>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Group Name</label>
                <input
                  type="text"
                  value={formData.newGroupName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, newGroupName: e.target.value }))}
                  placeholder="Enter group name"
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Group name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Create Method</label>
                <select
                  value={formData.createMethod}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      createMethod: e.target.value as 'manual' | 'merge' | 'city' | 'interest',
                      selectedUserIds: [],
                      selectedGroupIds: [],
                      selectedCities: [],
                      selectedInterests: [],
                      mergeGroupSearch: '',
                      interestSearch: '',
                      citySearch: '',
                    }))
                  }
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Select create method"
                >
                  <option value="manual">Manual</option>
                  <option value="merge">Merge Groups</option>
                  <option value="city">City-based</option>
                  <option value="interest">Interest-based</option>
                </select>
              </div>
              {formData.createMethod === 'manual' && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Search Users</label>
                    <input
                      type="text"
                      value={formData.createUserSearch}
                      onChange={(e) => setFormData((prev) => ({ ...prev, createUserSearch: e.target.value }))}
                      placeholder="Search users..."
                      className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Search users"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 mb-4">
                    <MultiSelect
                      options={filteredCreateUsers}
                      selected={formData.selectedUserIds}
                      onSelectionChange={(ids) => setFormData((prev) => ({ ...prev, selectedUserIds: ids }))}
                      getOptionId={(user) => user._id}
                      getOptionLabel={(user) => user.username || user.email || user.phone || 'Unknown'}
                      placeholder="No users found"
                    />
                  </div>
                </>
              )}
              {formData.createMethod === 'merge' && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Search Groups to Merge</label>
                  <input
                    type="text"
                    value={formData.mergeGroupSearch}
                    onChange={(e) => setFormData((prev) => ({ ...prev, mergeGroupSearch: e.target.value }))}
                    placeholder="Search groups..."
                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    aria-label="Search groups for merge"
                  />
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    <MultiSelect
                      options={filteredMergeGroups}
                      selected={formData.selectedGroupIds}
                      onSelectionChange={(ids) => setFormData((prev) => ({ ...prev, selectedGroupIds: ids }))}
                      getOptionId={(group) => group._id}
                      getOptionLabel={(group) => getGroupName(group)}
                      placeholder="No groups available"
                    />
                  </div>
                </div>
              )}
              {formData.createMethod === 'city' && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Select City</label>
                  <MultiCitySelect
                    selectedCities={formData.selectedCities}
                    onSelectionChange={(cities) => setFormData((prev) => ({ ...prev, selectedCities: cities }))}
                    searchTerm={formData.citySearch}
                    setSearchTerm={(term) => setFormData((prev) => ({ ...prev, citySearch: term }))}
                  />
                </div>
              )}
              {formData.createMethod === 'interest' && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Select Interest</label>
                  <SingleInterestSelect
                    selectedInterest={formData.selectedInterests[0] || ''}
                    onSelectionChange={handleSingleInterestChange}
                    interests={filteredInterestsCreate}
                    searchTerm={formData.interestSearch}
                    setSearchTerm={(term) => setFormData((prev) => ({ ...prev, interestSearch: term }))}
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setModals((prev) => ({ ...prev, create: false }));
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                  aria-label="Cancel create"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={isCreating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  aria-label="Create group"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
        {modals.edit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <button
                onClick={() => {
                  setModals((prev) => ({ ...prev, edit: false }));
                  resetForm();
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
                aria-label="Close edit modal"
              >
                ×
              </button>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Edit Group</h2>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Group Name</label>
                <input
                  type="text"
                  value={formData.newGroupName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, newGroupName: e.target.value }))}
                  placeholder="Enter group name"
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Group name"
                />
              </div>
              {currentGroup?.type === 'regular' && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Search Users</label>
                    <input
                      type="text"
                      value={formData.editUserSearch}
                      onChange={(e) => setFormData((prev) => ({ ...prev, editUserSearch: e.target.value }))}
                      placeholder="Search users..."
                      className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Search users"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 mb-4">
                    <MultiSelect
                      options={filteredEditUsers}
                      selected={formData.selectedUserIds}
                      onSelectionChange={(ids) => setFormData((prev) => ({ ...prev, selectedUserIds: ids }))}
                      getOptionId={(user) => user._id}
                      getOptionLabel={(user) => user.username || user.email || user.phone || 'Unknown'}
                      placeholder="No users found"
                    />
                  </div>
                </>
              )}
              {currentGroup?.type === 'city' && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Select City</label>
                  <MultiCitySelect
                    selectedCities={formData.selectedCities}
                    onSelectionChange={(cities) => setFormData((prev) => ({ ...prev, selectedCities: cities }))}
                    searchTerm={formData.citySearch}
                    setSearchTerm={(term) => setFormData((prev) => ({ ...prev, citySearch: term }))}
                  />
                </div>
              )}
              {currentGroup?.type === 'interest' && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Select Interest</label>
                  <SingleInterestSelect
                    selectedInterest={formData.selectedInterests[0] || ''}
                    onSelectionChange={handleSingleInterestChange}
                    interests={groupState.interests}
                    searchTerm={formData.interestSearch}
                    setSearchTerm={(term) => setFormData((prev) => ({ ...prev, interestSearch: term }))}
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setModals((prev) => ({ ...prev, edit: false }));
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                  aria-label="Cancel edit"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditGroup}
                  disabled={isEditing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  aria-label="Save group"
                >
                  {isEditing ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
        {modals.upload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <button
                onClick={() => setModals((prev) => ({ ...prev, upload: false }))}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
                aria-label="Close upload modal"
              >
                ×
              </button>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Upload Group</h2>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Upload Method</label>
                <select
                  value={formData.uploadMethod || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      uploadMethod: e.target.value as 'excel' | 'googleSheet' | null,
                    }))
                  }
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Select upload method"
                >
                  <option value="" disabled>
                    Select method
                  </option>
                  <option value="excel">Excel File</option>
                  <option value="googleSheet">Google Sheet</option>
                </select>
              </div>
              {/* {formData.uploadMethod === 'excel' && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Upload Excel File</label>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleExcelUpload}
                    className="w-full border border-gray-300 p-2 rounded-lg"
                    aria-label="Upload Excel file"
                  />
                </div>
              )} */}
              {formData.uploadMethod === 'excel' && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Upload Excel File</label>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleExcelUpload}
                    className="w-full border border-gray-300 p-2 rounded-lg"
                    aria-label="Upload Excel file"
                  />

                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Submit Excel
                  </button>
                </div>
              )}

              {formData.uploadMethod === 'googleSheet' && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Google Sheet Link</label>
                  <input
                    type="text"
                    value={formData.googleSheetLink}
                    onChange={(e) => setFormData((prev) => ({ ...prev, googleSheetLink: e.target.value }))}
                    placeholder="Enter Google Sheet URL"
                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Google Sheet URL"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setModals((prev) => ({ ...prev, upload: false }))}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                  aria-label="Cancel upload"
                >
                  Cancel
                </button>
                {formData.uploadMethod === 'googleSheet' && (
                  <button
                    onClick={handleGoogleSheetUpload}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    aria-label="Upload Google Sheet"
                  >
                    Upload
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {modals.userInterest && <UserInterestForm onClose={() => setModals((prev) => ({ ...prev, userInterest: false }))} />}
        {modals.view && formData.viewGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <button
                onClick={() => setModals((prev) => ({ ...prev, view: false }))}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
                aria-label="Close view modal"
              >
                ×
              </button>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">{getGroupName(formData.viewGroup)}</h2>
              <div className="mb-4 space-y-2">
                <p className="text-gray-700"><strong>Type:</strong> {formData.viewGroup.type.charAt(0).toUpperCase() + formData.viewGroup.type.slice(1)}</p>
                <p className="text-gray-700"><strong>Created At:</strong> {formatDate(formData.viewGroup.createdAt || '')}</p>
                <p className="text-gray-700"><strong>Members:</strong> {formData.viewGroup.userCount}</p>
                {isCityInterestGroup(formData.viewGroup) && (
                  <p className="text-gray-700"><strong>City:</strong> {formData.viewGroup.cities[0] || 'None'}</p>
                )}
                {isCityInterestGroup(formData.viewGroup) && (
                  <p className="text-gray-700"><strong>Interests:</strong> {formData.viewGroup.interests.map((i) => i.name).join(', ') || 'None'}</p>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {formData.viewGroup.users.length > 0 ? (
                  formData.viewGroup.users.map((token) => (
                    <div key={token._id} className="p-2 text-gray-700 hover:bg-gray-100 rounded">
                      {token.username || token.email || token.phone || 'Unknown'}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">No members found</p>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setModals((prev) => ({ ...prev, view: false }))}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                  aria-label="Close view"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default React.memo(DisplayGroup); // Memoize the main component for performance