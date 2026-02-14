import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Plus } from 'lucide-react';
import { generateId } from '../../utils/helpers';

const AddVehicleModal = ({ isOpen, onClose, onAdd, vehicle = null }) => {
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        plate: '',
        pricePerDay: '',
        category: 'Sedan',
        seats: 5,
        transmission: 'Automatic',
        fuel: 'Petrol',
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
    });

    // Pre-populate form when editing
    useEffect(() => {
        if (vehicle) {
            setFormData({
                brand: vehicle.brand || '',
                model: vehicle.model || '',
                year: vehicle.year || new Date().getFullYear(),
                plate: vehicle.plate || '',
                pricePerDay: vehicle.pricePerDay || '',
                category: vehicle.category || 'Sedan',
                seats: vehicle.seats || 5,
                transmission: vehicle.transmission || 'Automatic',
                fuel: vehicle.fuel || 'Petrol',
                image: vehicle.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
            });
        } else {
            setFormData({
                brand: '',
                model: '',
                year: new Date().getFullYear(),
                plate: '',
                pricePerDay: '',
                category: 'Sedan',
                seats: 5,
                transmission: 'Automatic',
                fuel: 'Petrol',
                image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
            });
        }
    }, [vehicle]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const vehicleData = {
            id: vehicle?.id || generateId('C'),
            ...formData,
            year: parseInt(formData.year),
            pricePerDay: parseFloat(formData.pricePerDay),
            seats: parseInt(formData.seats),
            status: vehicle?.status || 'Available',
            mileage: vehicle?.mileage || 0,
            health: vehicle?.health || 100,
            lastMaintenance: vehicle?.lastMaintenance || new Date().toISOString().split('T')[0],
        };

        onAdd(vehicleData);
        onClose();

        // Reset form
        if (!vehicle) {
            setFormData({
                brand: '',
                model: '',
                year: new Date().getFullYear(),
                plate: '',
                pricePerDay: '',
                category: 'Sedan',
                seats: 5,
                transmission: 'Automatic',
                fuel: 'Petrol',
                image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
            });
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={vehicle ? "Edit Vehicle" : "Add New Vehicle"} size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Brand */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Brand *
                        </label>
                        <select
                            name="brand"
                            value={formData.brand}
                            onChange={(e) => {
                                setFormData(prev => ({
                                    ...prev,
                                    brand: e.target.value,
                                    model: '' // Reset model when brand changes
                                }));
                            }}
                            required
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-white transition-colors font-bold appearance-none cursor-pointer"
                        >
                            <option value="">Select Brand</option>
                            <option value="Renault">Renault</option>
                            <option value="Peugeot">Peugeot</option>
                            <option value="Dacia">Dacia</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Model */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Model *
                        </label>
                        {['Renault', 'Peugeot', 'Dacia'].includes(formData.brand) ? (
                            <select
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-white transition-colors font-bold appearance-none cursor-pointer"
                            >
                                <option value="">Select Model</option>
                                {formData.brand === 'Renault' && (
                                    <>
                                        <option value="CLIO">CLIO</option>
                                        <option value="MEGANE">MEGANE</option>
                                    </>
                                )}
                                {formData.brand === 'Peugeot' && (
                                    <>
                                        <option value="208">208</option>
                                        <option value="308">308</option>
                                        <option value="2008">2008</option>
                                    </>
                                )}
                                {formData.brand === 'Dacia' && (
                                    <>
                                        <option value="SANDERO">SANDERO</option>
                                        <option value="LOGAN">LOGAN</option>
                                        <option value="STREETWAY">STREETWAY</option>
                                        <option value="STEPWAY">STEPWAY</option>
                                        <option value="DUSTER">DUSTER</option>
                                    </>
                                )}
                            </select>
                        ) : (
                            <input
                                type="text"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-bold"
                                placeholder="e.g., X5"
                            />
                        )}
                    </div>

                    {/* Year */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Year *
                        </label>
                        <input
                            type="number"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            required
                            min="2000"
                            max={new Date().getFullYear() + 1}
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-bold"
                        />
                    </div>

                    {/* License Plate */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            License Plate *
                        </label>
                        <input
                            type="text"
                            name="plate"
                            value={formData.plate}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-bold uppercase"
                            placeholder="e.g., ABC-1234"
                        />
                    </div>

                    {/* Price Per Day */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Price Per Day ($) *
                        </label>
                        <input
                            type="number"
                            name="pricePerDay"
                            value={formData.pricePerDay}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-bold"
                            placeholder="e.g., 120"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Category *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-white transition-colors font-bold appearance-none cursor-pointer"
                        >
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Sports">Sports</option>
                            <option value="Luxury">Luxury</option>
                        </select>
                    </div>

                    {/* Seats */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Seats *
                        </label>
                        <input
                            type="number"
                            name="seats"
                            value={formData.seats}
                            onChange={handleChange}
                            required
                            min="2"
                            max="9"
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-bold"
                        />
                    </div>

                    {/* Transmission */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Transmission *
                        </label>
                        <select
                            name="transmission"
                            value={formData.transmission}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-white transition-colors font-bold appearance-none cursor-pointer"
                        >
                            <option value="Automatic">Automatic</option>
                            <option value="Manual">Manual</option>
                        </select>
                    </div>

                    {/* Fuel Type */}
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Fuel Type *
                        </label>
                        <select
                            name="fuel"
                            value={formData.fuel}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-white transition-colors font-bold appearance-none cursor-pointer"
                        >
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </div>

                    {/* Image URL */}
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            Image URL
                        </label>
                        <input
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white transition-colors font-bold"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 justify-end pt-6 border-t border-zinc-800">
                    <Button variant="ghost" onClick={onClose} type="button" className="text-[10px] uppercase tracking-widest">
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" className="text-[10px] uppercase tracking-widest">
                        {vehicle ? 'Update Vehicle' : 'Add Vehicle'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddVehicleModal;
