import { Schema, model, Document, type Types } from "mongoose";


export interface IRefreshToken extends Document {
    user: Types.ObjectId;
    tokenHash: string;
    expiresAt: Date;
    revoked: boolean;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        tokenHash: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Date,
            required: true
        },
        revoked: {
            type: Boolean,
            default: false
        }
    },
        {
            timestamps: true
        }
)

refreshTokenSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});

export const RefreshToken = model<IRefreshToken>("RefreshToken", refreshTokenSchema);