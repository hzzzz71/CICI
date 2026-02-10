import { Product } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "JIELAN Air-Stride Pro",
    category: "Men's Running",
    price: 129.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaigDfxduUoIIkVRDaiSST59wxKi_kWNeoZe_FtKfNZTyKd7bzo2ptH8ux4KYq17wTAKg_bmhcO8UeBVTmM_rrcbVc4ADT3an95IvwE4MqJGNuQN5UOvbs5yVDBqB6OwiyXr_2Y465POs-IDaakJmgF0jMBkGD4q190LKqPN3WXFJB1zBX2kSdbs6YRYWczSdol4OmL6_5ecjLHKtS3dU_jrwSKEVLwiD8Oaj2m7DnVGK88iS14q8-4KfEUGgO1ax-745Y4NV8qvc",
    images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCaigDfxduUoIIkVRDaiSST59wxKi_kWNeoZe_FtKfNZTyKd7bzo2ptH8ux4KYq17wTAKg_bmhcO8UeBVTmM_rrcbVc4ADT3an95IvwE4MqJGNuQN5UOvbs5yVDBqB6OwiyXr_2Y465POs-IDaakJmgF0jMBkGD4q190LKqPN3WXFJB1zBX2kSdbs6YRYWczSdol4OmL6_5ecjLHKtS3dU_jrwSKEVLwiD8Oaj2m7DnVGK88iS14q8-4KfEUGgO1ax-745Y4NV8qvc",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCh5R-gG-KFp8g8jX6NmtgzE4gWRmrXD1zgJuiX-Hd52d7cHyCmxCg9C32G24zMGyJiSxykUIv7UpL3YV_mGIaMIzGuknF1nmhZrciZAXA-YJCKcxqiXKj9G4lA238BTUhdu9tGz9MBbDMu1OADcgElB0yIMXYEOstDDdqJPsStpbaDbOPv0Kb3KXLc675YBtZTFKETdVg8CCGwKnfU69nf21N9-yZEoEkCD2CJQ89KpDr8n3u2r8ZsneNEyvkKV42EB71Kfn24d_s",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBBFeaZ9o6Uifu1UdvtiWjEYF81cuDBMgvOlpYQRp5GRpJcQ7hravSd2rO7VHDR4JXAOsutIl9x3YV_wj8apyLZZUf-AFJ9IA_xK01fDMTXQ1189et-tbk4X_9yjLYo4zaftabITK7KQWzFuSjT4XMJPbwT0HmzDBlE4kg-KT53ebiDc0JP0QKXyGKTT-HYE1GDi8fOyvgtjp-Q5xI42MpTVI07kzEMWqBIbn1Gp3GpJhZD-r8NHTjuanqxVJ-gaAkFpXTGaBdiEZ0",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCc_l-hCyE5oUhHxRUhJPfKPOQg73y0R2drqSQUwDRwGTp-KEIUzHuVF5a_oEU3VjnEHzpspdLw-2S8yqTqWpeelYr8toV6ORB2KW129Db1vFFEZ45LT4O16_gKD51HRkmXOCmOt-VLVJ4sQBYllnV1xkOdBF7jRbYFQclKNc38E969NaPPajZ-I5IeUOhy_t4MEuw0XzSt981zv-o18_gAcsNyqxI-OIuYiaRTaPV6DBea7D-gAE2wuJKqXN0G8D3FJhlTpXJBXZY"
    ],
    rating: 4.8,
    reviews: 124,
    description: "Engineered for the daily runner. Features breathable mesh upper for maximum airflow and our proprietary soft-foam sole for impact absorption on any terrain.",
    colors: ["#dc2626", "#000000", "#ffffff", "#2563eb"],
    isNew: true
  },
  {
    id: "2",
    name: "Urban Runner V2",
    category: "Unisex Lifestyle",
    price: 145.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5pH8qkhonNxc3vv37sX2XvrbVSpKymzmACeOnAMmpLk2DCMIfjN7jSR7Rr4p_0FYeP2gFrJh4rWhzOKJ34H2osvO7F1SCa2hti5hPdMoMnIaldsAcydZ2Uq5UwcQRFncwLw5PrjhoDCurZ2mfcLhQeR7IM79bJg1JDwu-anzFAdirSsiSEszsWjs_nJej1pELQbK0tTu9Q2QckFd6G6rVXkyMjQK93xyGEYHEBe0ou01Kd15VKoQRlcpNfhfJETKq_q2MvpoBnuE",
    colors: ["#16a34a", "#ffffff", "#eab308"]
  },
  {
    id: "3",
    name: "Cloud Walker",
    category: "Women's Walking",
    price: 89.00,
    originalPrice: 110.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvpAItsl0Fsz_ic6YzOsdyllkVTu8BEWBgYlAEZPstiG7DlYxF9BBoXoF0Jn_zXDryCpgH9_di3t2xPPRDhurGqscKnnfU11067ltuTj4vWblf1wGCORKcNyrG4Qqn34J8Io4yZ28aejhUSJxxzKpAKnSUUJL76PhpcNVu0q5_qyUuCJ5R39jIwYF_MxR5mEdzpKOqjcCrnwDTez1E3NxwT9Q-HDgBlaIRJafpfGD2a9pm9JtibtkWUSeooBHT2cUTBAusNCU4mMw",
    isSale: true,
    colors: ["#fce7f3", "#dbeafe"]
  },
  {
    id: "4",
    name: "Classic Oxford",
    category: "Men's Formal",
    price: 180.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDf8Q_m8ep-8BvmCuYXNfaHD_D277pjc4Q2mFytqWdDhtMirH3CW_WSFFVZxt3jiZgAh9ghulIXUQuIf65XBNKad16NlqI9TcX6QDY-GJqq9k84hkiHoQIhhZEXCoZ09UOT2I10pdqccnI3qcrQzYs2DvuIdhNTy3LSULH03U-_p3sST6JMxv_eXfDznq93RENtjSXoVUFMuYiPkslqMXf3fsEne4Mq4s--rWbsqqdisncVG4GJ5CjkWRIz6VD4FJL7MOqGm6dO20k",
    colors: ["#8B4513", "#000000"]
  },
  {
    id: "5",
    name: "Sprint Master",
    category: "Performance Running",
    price: 130.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCz4mbyA1oe7xKKrHKWBHnPzaXqWnVvVUfbAbDwG0QhmkOzNpN9h6X51arb9NYMUT58C78iB8MASBYIGf9ukREWl46Pc189QYrqkkNP8earn4c59-CJPFN_bsunjx60q-ItQL1mbddvxj4m-4SHjRW5whdNlAqaYDY7x0lNZgH8GkA4LrDiiAabfucZuTzIUqImjgq76948Kh5U2y2D-j-RDtUz716Y0_7i275IdI7F7uQddJSA4Uyhmr3gqPU76SWtRljxet34J_A",
    colors: ["#fb923c", "#60a5fa", "#a855f7"]
  },
  {
    id: "6",
    name: "Court King",
    category: "Basketball",
    price: 160.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAq59WDeLmQTbB6nwF60rf6A7fhH_uvmcL-ReZzeBkb7WOb_RBRJmz_uE0yuNgAYF9rtQCm4JHNbbUQf90TKNCXjELTwfhNhbZmYj9_oNOj4qCHtvIgpsiUbkNzUs4yR51Mz8ZxWGEuE67kWaMFlbf7WT5OjO1TNn8GyILvP4pMf4AAnPAvk0wEhxfauOlTZNOcy-bNdrm1vk7JKFwOrRG2fd5-ZBitEqQNKsQCThb7aTfX9NBRJnEbcNpZ-WCB_Ntt598YVED7cj4",
    colors: ["#dc2626", "#000000"]
  },
  {
      id: "7",
      name: "Daily Driver",
      category: "Casual",
      price: 65.00,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5auiSjlP1GCrh0XcJmOfE7YdQYeDZeH9dBksWP5ud1xFsMFhuHmOsvMpzpyNxDTvMyjzKdlRZbiWf04hEinJrwH6eBpLOlnqbLfW3vLO2IuEtUxETm19BEkv1sON7MsmUQKSdkUC0U8P2ISZy4j0BhuK5k-eeMxWqhf_5vCxH_3OJMze8nmp-_KYkETzHySvZwYlzgMcbIsqcuuMlUPwdmHRkBN64ra5gFSY1REWRyma7QOHm7_y88CGrXkYNQ4XsNjKT6O7yLzw",
      colors: ["#1e40af", "#78716c"]
  },
  {
      id: "8",
      name: "Pro Trainer X",
      category: "Pro Running",
      price: 195.00,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXRaweyO1owS_sqz_gwChQ2Gn2LGdUsty2bv-CcDyi84rlroYRnBYsppV1vUCF_ZQbadBYxo_sa6U86TRnyMIquXH_5LaABaI8m6_hUuIuXhA2DjBx1oV1bnIUkFHfgwsAIwaA4Pt31UfvR7lPisHHYOOS_zJy9qS0OncXAgjfJFIOIFpbkzpJUZA_p5QG-tb3uNGRfvbXRfz_KITQ5Lw7TmRDwzMouSAnHea7brf1zasXRuZcQ_RvBDl-7oDNNkLYv9O3inZ-ymI",
      isLimited: true,
      colors: ["#ffffff", "#2563eb"]
  },
  {
      id: "9",
      name: "Desert Trek",
      category: "Outdoor",
      price: 140.00,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4in7LhRp4CQCHol13tUEvu0SYE6QDAdmLEQ7Xlv65i8kFv_ORwgcAPL8IVy2FcCVCdMgjeinNlREGuOlYDtbgBuCU8phTs9jwPannDgYnxT-C2pgRrFLWUp-wJPRjLssBErG4Ov7lndGyq2I7LuS_dBY3PCMQ9gE7XESUxCwdu_TStgDcR-FId0dXO-uVbEYX_omNIf6Ksqs2UPOhSW44Oe8oGmuueE1mu6nc1fdmNX8_i86WsuQPYNbgidVy61H8FeRCSE5jjUM",
      colors: ["#8B4513", "#D2B48C"]
  }
];