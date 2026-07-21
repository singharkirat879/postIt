/**
 * Custom Cloudinary storage engine for multer v2.
 * multer-storage-cloudinary@4 was built for multer v1 and is incompatible
 * with multer v2's storage engine API (_handleFile signature changed).
 * This engine implements the multer v2 contract directly.
 */
const cloudinary = require('./cloudinary');
const { Readable } = require('stream');

class CloudinaryStorageV2 {
    constructor(options = {}) {
        this.folder = options.folder || 'uploads';
        this.allowed_formats = options.allowed_formats || ['jpg', 'jpeg', 'png', 'webp'];
    }

    /**
     * multer v2 calls _handleFile(req, file, cb) where cb is (err, info).
     * info must include at least { path, size } but we also expose filename
     * (the Cloudinary public_id) so the controller can store it.
     */
    _handleFile(req, file, cb) {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: this.folder,
                allowed_formats: this.allowed_formats,
            },
            (error, result) => {
                if (error) return cb(error);
                cb(null, {
                    fieldname: file.fieldname,
                    originalname: file.originalname,
                    encoding: file.encoding,
                    mimetype: file.mimetype,
                    path: result.secure_url,      // imageUrl stored in DB
                    filename: result.public_id,   // imagePublicId stored in DB
                    size: result.bytes,
                    cloudinary: result,
                });
            }
        );

        // Pipe multer's file stream into the Cloudinary upload stream
        file.stream.pipe(uploadStream);
    }

    /**
     * multer v2 calls _removeFile(req, file, cb) on cleanup/error.
     */
    _removeFile(req, file, cb) {
        if (file.filename) {
            cloudinary.uploader.destroy(file.filename, cb);
        } else {
            cb(null);
        }
    }
}

module.exports = CloudinaryStorageV2;
