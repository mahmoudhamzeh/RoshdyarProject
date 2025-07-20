import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './AddChildPage.css';

const AddChildPage = () => {
    const history = useHistory();
    // I've added all fields to the initial state
    const [formData, setFormData] = useState({ firstName: '', lastName: '', birthDate: '', height: '', weight: '', bloodType: 'A+', medicalHistory: '', notes: '' });
    const [preview, setPreview] = useState(null);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "avatar") {
            if (files && files[0]) {
                setPreview(URL.createObjectURL(files[0]));
            }
        } else {
            setFormData(prevState => ({ ...prevState, [name]: value }));
        }
    };

    // This is the final, working submit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/children', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                alert('کودک با موفقیت اضافه شد!');
                history.push('/my-children'); // <-- This line is now active
            } else {
                const errorData = await response.json();
                alert(`خطا در افزودن کودک: ${errorData.message}`);
            }
        } catch (error) {
            alert('خطا در ارتباط با سرور.');
            console.error("Submit error:", error);
        }
    };

    // The JSX part is the same full form as before
    return (
        <div className="add-child-page-v2">
            <nav className="page-nav-final">{/* ... */}</nav>
            <div className="add-child-form-container-v2">
                <form onSubmit={handleSubmit} className="add-child-form">
                    {/* All form fields are here... */}
                    <div className="form-group-full avatar-upload-area">
                        <label htmlFor="avatar">عکس پروفایل کودک</label>
                        <img src={preview || 'https://i.pravatar.cc/150?u=default'} alt="پیش‌نمایش عکس" className="avatar-preview" />
                        <input type="file" id="avatar" name="avatar" onChange={handleChange} accept="image/*" capture="user" />
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label>نام</label><input name="firstName" value={formData.firstName} onChange={handleChange} required /></div>
                        <div className="form-group"><label>نام خانوادگی</label><input name="lastName" value={formData.lastName} onChange={handleChange} required /></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label>تاریخ تولد</label><input name="birthDate" placeholder="مثال: ۱۳۸۵/۰۵/۱۴" value={formData.birthDate} onChange={handleChange} required /></div>
                        <div className="form-group"><label>گروه خونی</label><select name="bloodType" value={formData.bloodType} onChange={handleChange}><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label>قد (سانتی‌متر)</label><input type="number" name="height" value={formData.height} onChange={handleChange} /></div>
                        <div className="form-group"><label>وزن (کیلوگرم)</label><input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} /></div>
                    </div>
                    <div className="form-group-full"><label>سابقه بیماری</label><textarea name="medicalHistory" value={formData.medicalHistory} rows="4" onChange={handleChange}></textarea></div>
                    <div className="form-group-full"><label>توضیحات</label><textarea name="notes" value={formData.notes} rows="4" onChange={handleChange}></textarea></div>
                    <div className="form-actions">
                        <button type="submit" className="btn-save">ذخیره</button>
                        <button type="button" onClick={() => history.push('/my-children')} className="btn-cancel">انصراف</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddChildPage;