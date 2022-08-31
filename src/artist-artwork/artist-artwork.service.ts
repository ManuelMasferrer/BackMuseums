import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Artist } from 'src/artist/artist.entity';
import { Exhibition } from 'src/exhibition/exhibition.entity';
import { MuseumEntity } from 'src/museum/museum.entity';
import { BusinessLogicException, BusinessError } from 'src/shared/errors/business-errors';
import { Repository } from 'typeorm';
import { ArtworkDTO } from '../artwork/artwork.dto';
import { Artwork } from '../artwork/artwork.entity';

@Injectable()
export class ArtistArtworkService {
    constructor(
        @InjectRepository(Artwork)
        private readonly artworkRepository: Repository<Artwork>,
        @InjectRepository(MuseumEntity)
        private readonly museumRepository: Repository<MuseumEntity>,
        @InjectRepository(Exhibition)
        private readonly exhibitionRepository: Repository<Exhibition>,
        @InjectRepository(Artist)
        private readonly artistRepository: Repository<Artist>,
    ) { }

    async findAll(artistId: number): Promise<ArtworkDTO[]> {
        const artist = await this.artistRepository.findOne(artistId, { relations: ['artworks'] });
        if (!artist)
            throw new BusinessLogicException("The artist with the given id was not found", BusinessError.NOT_FOUND);
        return artist.artworks;
    }

    async findOne(artistId: number, artworkId: number): Promise<ArtworkDTO> {
        const artist = await this.artistRepository.findOne(artistId, { relations: ["artworks"] });
        if (!artist)
            throw new BusinessLogicException("The artist with the given id was not found", BusinessError.NOT_FOUND);

        const artwork = await this.artworkRepository.findOne(artworkId, { relations: ["artist"] });
        if (!artwork)
            throw new BusinessLogicException("The artwork with the given id was not found", BusinessError.NOT_FOUND)

        const artworkartist = artist.artworks.find(e => e.id === artwork.id);
        if (!artworkartist)
            throw new BusinessLogicException("The artwork is not associated to the artist", BusinessError.NOT_FOUND)

        return artwork;
    }

    async create(artistId: number, artworkId: number): Promise<ArtworkDTO> {

        const artist = await this.artistRepository.findOne(artistId);
        if (!artist)
            throw new BusinessLogicException("The artist with the given id was not found", BusinessError.NOT_FOUND);
        
        const artwork = await this.artworkRepository.findOne(artworkId);
            if (!artwork)
                throw new BusinessLogicException("The artwork with the given id was not found", BusinessError.NOT_FOUND);

        artwork.artist = artist;
        
        return await this.artworkRepository.save(artwork);
    }

    async update(artistId: number, artworkId: number): Promise<Artwork> {
        const artwork = await this.artworkRepository.findOne(artworkId);
        if (!artwork)
            throw new BusinessLogicException("The artwork with the given id was not found", BusinessError.NOT_FOUND)

        const artist = await this.artistRepository.findOne(artworkId);
        if (!artist)
            throw new BusinessLogicException("The artist with the given id was not found", BusinessError.NOT_FOUND)

        artwork.artist = artist;
    
        await this.artworkRepository.save(artwork);
        return artwork;
    }

    async delete(artistId: number, artworkId: number) {
        const artist = await this.artistRepository.findOne(artistId, { relations: ['artworks'] });
        if (!artist)
            throw new BusinessLogicException("The artist with the given id was not found", BusinessError.NOT_FOUND)

        const artwork = await this.artworkRepository.findOne(artworkId);
        if (!artwork)
            throw new BusinessLogicException("The artwork with the given id was not found", BusinessError.NOT_FOUND)

        artist.artworks = artist.artworks.filter(e => e.id !== artwork.id);
        await this.artistRepository.save(artist);
        return await this.artworkRepository.remove(artwork);
    }
}