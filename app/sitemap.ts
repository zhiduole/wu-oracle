import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.wuask.me',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    // 以后加了新页面就在这里追加
  ]
}
