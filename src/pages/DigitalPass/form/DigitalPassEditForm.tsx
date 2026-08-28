import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  TextField,
  Checkbox,
  FormControlLabel,
  Box,
  Button as MuiButton,
  CircularProgress,
  Typography,
  Alert,
  FormGroup,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import Button from "../../../components/button/Button";
import { eventPass_format, MamberAPI } from "../../../api/config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface FieldConfig {
  _id?: string;
  label: string;
  type: "text" | "email" | "number" | "textarea";
  required: boolean;
  placeholder?: string;
}

const DigitalPassEditForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [accessType, setAccessType] = useState<"public" | "private">("public");
  const [fields, setFields] = useState<FieldConfig[]>([]);

  const [members, setMembers] = useState<any[]>([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());

  const location = useLocation();
  console.log("🚀 ~ DigitalPassEditForm ~ location:", location.state.eventId)
  const eventId = location.state.eventId;
  // ========================= Fetch Members ===========================
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setMemberLoading(true);
        const res = await axios.get(MamberAPI);

        let data = [];
        if (Array.isArray(res.data)) data = res.data;
        else if (res.data?.data) data = res.data.data;
        else if (res.data?.members) data = res.data.members;

        setMembers(data);
      } catch (err) {
        toast.error("Failed to load members");
      } finally {
        setMemberLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // ========================= Fetch Form Template ===========================
  useEffect(() => {
    if (!formId) return;

    const fetchForm = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${eventPass_format}/formDetails/${formId}`);
        const f = res.data.form;

        setForm(f);
        setTitle(f.title);
        setDescription(f.description || "");
        setAccessType(f.accessType);
        setFields(f.fields || []);

        // Convert privateUsers → Member IDs
        if (Array.isArray(f.privateUsers)) {
          const ids = f.privateUsers.map((u: any) => u._id);
          setSelectedMemberIds(new Set(ids));
        }
      } catch {
        toast.error("Failed to load form");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  // ========================= Toggle Member Selection ===========================
  const toggleMember = (id: string) => {
    setSelectedMemberIds(prev => {
      const updated = new Set(prev);
      updated.has(id) ? updated.delete(id) : updated.add(id);
      return updated;
    });
  };

  // ========================= Dynamic Fields Logic ===========================
  const updateField = (i: number, key: keyof FieldConfig, value: any) => {
    setFields(prev => {
      const x = [...prev];
      x[i] = { ...x[i], [key]: value };
      return x;
    });
  };

  const addField = () => {
    setFields(prev => [...prev, { label: "", type: "text", required: false }]);
  };

  const removeField = (i: number) => {
    if (fields.length === 1) return toast.warning("At least one field is required");
    setFields(prev => prev.filter((_, index) => index !== i));
  };

  // ========================= Submit Handler ===========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Title required");

    try {
      setIsSubmitting(true);

      const payload = {
        title,
        description,
        accessType,
        fields,
        privateUsers: Array.from(selectedMemberIds) // ⭐ ONLY IDs
      };

      const res = await axios.patch(`${eventPass_format}/${formId}`, payload);

      if (res.data.success) {
        toast.success("Updated successfully!");
        navigate(`/digitalPass/form/view/${eventId}`);
      }

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================= UI ===========================
  if (loading)
    return <div className="flex justify-center py-20"><CircularProgress /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto flex justify-center">
      <ToastContainer />
      <div className="max-w-[30rem]">
        <h2 className="text-3xl font-bold mb-6 text-blue-700">Edit Form Template</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TextField fullWidth label="Form Title *" value={title} onChange={e => setTitle(e.target.value)} />

          <TextField fullWidth multiline rows={3} label="Description" value={description} onChange={e => setDescription(e.target.value)} />

          <FormControl fullWidth>
            <InputLabel>Access Type</InputLabel>
            <Select value={accessType} onChange={e => setAccessType(e.target.value as any)}>
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="private">Private</MenuItem>
            </Select>
          </FormControl>

          {/* PRIVATE USERS */}
          {accessType === "private" && (
            <div className="bg-purple-50 rounded-xl p-5 border">
              <h3 className="text-xl font-semibold mb-4">Select Private Users</h3>

              {memberLoading ? (
                <CircularProgress />
              ) : (
                <FormGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto p-3 bg-white rounded-lg shadow">
                  {members.map(member => (
                    <FormControlLabel
                      key={member._id}
                      control={
                        <Checkbox
                          checked={selectedMemberIds.has(member._id)}
                          onChange={() => toggleMember(member._id)}
                        />
                      }
                      label={
                        <div>
                          <div className="font-semibold">{member.typeName}</div>
                          {/* <div className="text-sm text-gray-600">{member.email}</div> */}
                        </div>
                      }
                    />
                  ))}
                </FormGroup>
              )}
            </div>
          )}

          {/* DYNAMIC FIELDS */}
          <div>
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-semibold">Additional Fields</h3>
              <MuiButton startIcon={<Add />} onClick={addField}>Add Field</MuiButton>
            </div>

            {fields.map((f, i) => (
              <Box key={i} className="border p-4 rounded-lg mb-3 bg-gray-50">
                <div className="flex justify-between">
                  <b>Field {i + 1}</b>
                  <IconButton color="error" onClick={() => removeField(i)}>
                    <Delete />
                  </IconButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <TextField label="Label" value={f.label} onChange={e => updateField(i, "label", e.target.value)} required />

                  <FormControlLabel control={<Checkbox checked={f.required} onChange={e => updateField(i, "required", e.target.checked)} />} label="Required" />

                  <FormControl>
                    <InputLabel>Type</InputLabel>
                    <Select value={f.type} onChange={e => updateField(i, "type", e.target.value as any)}>
                      <MenuItem value="text">Text</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="textarea">Textarea</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField label="Placeholder" value={f.placeholder || ""} onChange={e => updateField(i, "placeholder", e.target.value)} />
                </div>
              </Box>
            ))}
          </div>

          <Button text="Save Changes" loading={isSubmitting} />
        </form>
      </div>
    </div>
  );
};

export default DigitalPassEditForm;
