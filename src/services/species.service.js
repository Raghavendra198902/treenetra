const Species = require('../models/species.model');
const { ApiError } = require('../utils/apiError');

class SpeciesService {
  async getAllSpecies(options = {}) {
    const { page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const [species, total] = await Promise.all([
      Species.find()
        .skip(skip)
        .limit(limit)
        .sort({ commonName: 1 }),
      Species.countDocuments()
    ]);

    return {
      species,
      pagination: {
        page,
        limit,
        total
      }
    };
  }

  async searchSpecies(query) {
    const species = await Species.find({
      $text: { $search: query }
    }).limit(50);

    return species;
  }

  async getSpeciesById(speciesId) {
    const species = await Species.findById(speciesId);
    
    if (!species) {
      throw new ApiError(404, 'Species not found');
    }

    return species;
  }

  async createSpecies(speciesData) {
    const existing = await Species.findOne({ 
      scientificName: speciesData.scientificName 
    });

    if (existing) {
      throw new ApiError(409, 'Species with this scientific name already exists');
    }

    const species = new Species(speciesData);
    await species.save();

    return species;
  }

  async updateSpecies(speciesId, updateData) {
    const species = await Species.findByIdAndUpdate(
      speciesId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!species) {
      throw new ApiError(404, 'Species not found');
    }

    return species;
  }

  async deleteSpecies(speciesId) {
    const species = await Species.findByIdAndDelete(speciesId);
    
    if (!species) {
      throw new ApiError(404, 'Species not found');
    }

    return species;
  }
}

module.exports = new SpeciesService();
