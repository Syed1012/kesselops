package de.kesselops.shared.config;

import io.minio.*;
import io.minio.errors.*;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

/**
 * Service for MinIO object storage operations.
 */
@Service
public class MinioService {

    private static final Logger log = LoggerFactory.getLogger(MinioService.class);

    private final MinioClient minioClient;

    @Value("${minio.bucket:kesselops-tasks}")
    private String bucketName;

    @Value("${minio.endpoint:http://localhost:9000}")
    private String endpoint;

    public MinioService(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    @PostConstruct
    public void init() {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucketName).build());
            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(bucketName).build());
                log.info("Created MinIO bucket: {}", bucketName);
            }
        } catch (Exception e) {
            log.warn("Could not initialize MinIO bucket '{}': {}", bucketName, e.getMessage());
        }
    }

    /**
     * Upload a file to MinIO.
     *
     * @param file the multipart file to upload
     * @param folder subfolder in bucket (e.g. "task-photos")
     * @return the public URL of the uploaded object
     */
    public String uploadFile(MultipartFile file, String folder) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String objectName = folder + "/" + UUID.randomUUID() + extension;

            try (InputStream inputStream = file.getInputStream()) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(objectName)
                                .stream(inputStream, file.getSize(), -1)
                                .contentType(file.getContentType())
                                .build());
            }

            String url = endpoint + "/" + bucketName + "/" + objectName;
            log.debug("Uploaded file to MinIO: {}", url);
            return url;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to MinIO: " + e.getMessage(), e);
        }
    }

    /**
     * Delete a file from MinIO.
     *
     * @param objectUrl the full URL of the object
     */
    public void deleteFile(String objectUrl) {
        try {
            String prefix = endpoint + "/" + bucketName + "/";
            if (objectUrl.startsWith(prefix)) {
                String objectName = objectUrl.substring(prefix.length());
                minioClient.removeObject(
                        RemoveObjectArgs.builder()
                                .bucket(bucketName)
                                .object(objectName)
                                .build());
                log.debug("Deleted file from MinIO: {}", objectName);
            }
        } catch (Exception e) {
            log.warn("Failed to delete file from MinIO: {}", e.getMessage());
        }
    }
}
