package com.draxlmaier.hub.mapper;

import com.draxlmaier.hub.dto.AnnouncementDTO;
import com.draxlmaier.hub.model.Announcement;
import jakarta.ejb.Singleton;

@Singleton
public class AnnouncementMapper {

    public AnnouncementDTO toDTO(Announcement entity) {
        if (entity == null) return null;

        return AnnouncementDTO.builder()
            .id(entity.getId())
            .title(entity.getTitle())
            .description(entity.getDescription())
            .date(entity.getAnnouncementDate())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    public Announcement toEntity(AnnouncementDTO dto) {
        if (dto == null) return null;

        return Announcement.builder()
            .title(dto.getTitle())
            .description(dto.getDescription())
            .announcementDate(dto.getDate())
            .build();
    }

    public Announcement updateEntity(Announcement existing, AnnouncementDTO dto) {
        if (dto == null) return existing;

        if (dto.getTitle() != null) {
            existing.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null) {
            existing.setDescription(dto.getDescription());
        }
        if (dto.getDate() != null) {
            existing.setAnnouncementDate(dto.getDate());
        }

        return existing;
    }
}
