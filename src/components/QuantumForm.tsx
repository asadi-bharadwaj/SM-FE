import React, { useState, useEffect } from 'react';

interface QuantumFormProps {
  title: string;
  subtitle: string;
  fields: Array<{
    name: string;
    type: string;
    placeholder: string;
    required?: boolean;
  }>;
  buttonText: string;
  onSubmit: (data: Record<string, string>) => void;
  loading?: boolean;
  error?: string;
  footer?: React.ReactNode;
}

const QuantumForm: React.FC<QuantumFormProps> = ({
  title,
  subtitle,
  fields,
  buttonText,
  onSubmit,
  loading = false,
  error,
  footer
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    // Initialize form data
    const initialData: Record<string, string> = {};
    fields.forEach(field => {
      initialData[field.name] = '';
    });
    setFormData(initialData);
  }, [fields]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="quantum-form-container">
      <div className="quantum-form-header">
        <h1>{title}</h1>
        <p className="quantum-subtitle">{subtitle}</p>
      </div>

      {error && (
        <div className="quantum-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="quantum-form">
        {fields.map((field, index) => (
          <div key={field.name} className="quantum-field-wrapper">
            <div className={`quantum-input-container ${focusedField === field.name ? 'focused' : ''}`}>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                onFocus={() => setFocusedField(field.name)}
                onBlur={() => setFocusedField(null)}
                required={field.required}
                className="quantum-input"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              />
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="quantum-button"
        >
          <span className="button-text">
            {loading ? 'Processing...' : buttonText}
          </span>
        </button>
      </form>

      {footer && (
        <div className="quantum-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default QuantumForm;