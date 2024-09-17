export interface Icon {
  name: string
  alternativeText: string | null
  caption: string | null
  width: number
  height: number
  formats: any
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl: string | null
  provider: string
  provider_metadata: any
  createdAt: string
  updatedAt: string
}

export interface IconData {
  id: number
  attributes: Icon
}

interface Pagination {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

export interface CategoryList {
  id: number
  attributes: {
    Name: string
    Slug: string
    ShortDescription: string
    Icon: {
      data: IconData
    }
  }
}

//Category List API response
export interface CategoryListAPIResponse {
  data: CategoryList[]
  meta: {
    pagination: Pagination
  }
}

export interface Category {
  id: number
  attributes: {
    Name: string
    Slug: string
    Description: string
    ShortDescription: string
    Sequence: number
    createdAt: string
    updatedAt: string
    publishedAt: string
    Icon: {
      data: IconData
    }
  }
}

//Category Detail API list response
export interface CategoryAPIResponse {
  data: Category[]
  meta: {
    pagination: Pagination
  }
}

// Question Answer Types
export interface SubCategory {
  id: number
  attributes: {
    Name: string
    Slug: string
    Description: string
    ShortDescription: string
    Sequence: number
    createdAt: string
    updatedAt: string
    publishedAt: string
    Icon: {
      data: IconData
    }
    Category: {
      data: {
        attributes: {
          Name: string
          Slug: string
        }
      }
    }
  }
}

export interface SubCategoryAPIResponse {
  data: SubCategory[]
  meta: {
    pagination: Pagination
  }
}

export interface SubCateoryList {
  id: number
  attributes: {
    Name: string
    Slug: string
  }
}

export interface SubCateoryListAPIResponse {
  data: SubCateoryList[]
  meta: {
    pagination: Pagination
  }
}

// Question Answer Types

export interface QAAttributes {
  id: number
  attributes: {
    Question: string
    Answer: string
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
}

export interface QAAPIResponse {
  data: QAAttributes[]
  meta: {
    pagination: Pagination
  }
}

// Search Result Types

export interface SearchResultAttributes {
  Question: string
  Category: {
    data?: {
      id: number
      attributes?: {
        Slug: string
      }
    }
  }
  SubCategory: {
    data?: {
      id: number
      attributes?: {
        Slug: string
      }
    }
  }
}

export interface SearchResult {
  id: number
  attributes: SearchResultAttributes
}

export interface ResultsData {
  data: SearchResult[]
  meta: {
    pagination: Pagination
  }
}
