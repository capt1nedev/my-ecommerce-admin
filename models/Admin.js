import { Schema, model, models } from "mongoose"

const adminSchema = new Schema({
    email: { type: String, required: true, unique: true },
}, { timestamps: true });

export const Admin = models?.Admin || model('Admin', adminSchema);