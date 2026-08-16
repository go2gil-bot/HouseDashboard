"""
דאשבורד נדל"ן - Ames Housing Dataset
הרצה:  streamlit run app.py
"""

import pathlib

import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st

DATA_PATH = pathlib.Path(__file__).parent / "dataset.csv"

st.set_page_config(
    page_title='דאשבורד נדל"ן',
    page_icon="🏠",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ---------- עיצוב RTL ----------
st.markdown(
    """
    <style>
        .stApp { direction: rtl; }
        section[data-testid="stSidebar"] { direction: rtl; }
        h1, h2, h3, h4, p, label, .stMarkdown { text-align: right; }
        div[data-testid="stMetricValue"] { direction: ltr; text-align: right; }
        div[data-testid="stMetric"] {
            background: rgba(128,128,128,0.08);
            border: 1px solid rgba(128,128,128,0.20);
            border-radius: 12px;
            padding: 14px 18px;
        }
        div[data-testid="stMetricLabel"] { justify-content: flex-start; }
    </style>
    """,
    unsafe_allow_html=True,
)

PLOT_TEMPLATE = "plotly_white"
SEQ = px.colors.sequential.Teal
QUAL = px.colors.qualitative.Set2


# ---------- טעינת נתונים ----------
@st.cache_data
def load_data(path: pathlib.Path) -> pd.DataFrame:
    df = pd.read_csv(path, na_values=["NA"], keep_default_na=True)

    # שדות מחושבים
    df["TotalSF"] = df["TotalBsmtSF"].fillna(0) + df["1stFlrSF"] + df["2ndFlrSF"]
    df["PricePerSF"] = df["SalePrice"] / df["GrLivArea"].replace(0, np.nan)
    df["HouseAge"] = df["YrSold"] - df["YearBuilt"]
    df["RemodAge"] = df["YrSold"] - df["YearRemodAdd"]
    df["TotalBaths"] = (
        df["FullBath"]
        + 0.5 * df["HalfBath"]
        + df["BsmtFullBath"].fillna(0)
        + 0.5 * df["BsmtHalfBath"].fillna(0)
    )
    df["HasGarage"] = np.where(df["GarageArea"].fillna(0) > 0, "עם חניה", "ללא חניה")
    df["HasPool"] = np.where(df["PoolArea"] > 0, "עם בריכה", "ללא בריכה")
    df["HasFireplace"] = np.where(df["Fireplaces"] > 0, "עם קמין", "ללא קמין")
    df["SaleDate"] = pd.to_datetime(
        dict(year=df["YrSold"], month=df["MoSold"], day=1)
    )
    df["Decade"] = (df["YearBuilt"] // 10 * 10).astype(int).astype(str) + "s"
    return df


try:
    df = load_data(DATA_PATH)
except FileNotFoundError:
    st.error(f"לא נמצא קובץ הנתונים: {DATA_PATH}")
    st.stop()


def fmt_money(x) -> str:
    if pd.isna(x):
        return "—"
    return f"${x:,.0f}"


# ---------- סרגל צד: פילטרים ----------
st.sidebar.header("🔎 פילטרים")

if st.sidebar.button("↺ איפוס כל הפילטרים", width="stretch"):
    for k in list(st.session_state.keys()):
        if k.startswith("f_"):
            del st.session_state[k]
    st.rerun()

price_min, price_max = int(df.SalePrice.min()), int(df.SalePrice.max())
price_rng = st.sidebar.slider(
    "טווח מחיר ($)",
    price_min,
    price_max,
    (price_min, price_max),
    step=5_000,
    key="f_price",
)

neighborhoods = sorted(df.Neighborhood.unique())
sel_nb = st.sidebar.multiselect(
    "שכונה", neighborhoods, default=[], key="f_nb",
    help="ריק = כל השכונות",
)

year_min, year_max = int(df.YearBuilt.min()), int(df.YearBuilt.max())
year_rng = st.sidebar.slider(
    "שנת בנייה", year_min, year_max, (year_min, year_max), key="f_year"
)

qual_rng = st.sidebar.slider(
    "איכות כללית (1-10)",
    int(df.OverallQual.min()),
    int(df.OverallQual.max()),
    (int(df.OverallQual.min()), int(df.OverallQual.max())),
    key="f_qual",
)

area_min, area_max = int(df.GrLivArea.min()), int(df.GrLivArea.max())
area_rng = st.sidebar.slider(
    "שטח מגורים (sq ft)", area_min, area_max, (area_min, area_max), step=50,
    key="f_area",
)

with st.sidebar.expander("פילטרים נוספים"):
    sel_style = st.multiselect(
        "סגנון בית", sorted(df.HouseStyle.unique()), default=[], key="f_style"
    )
    sel_type = st.multiselect(
        "סוג מבנה", sorted(df.BldgType.unique()), default=[], key="f_type"
    )
    sel_zone = st.multiselect(
        "אזור תכנון (Zoning)", sorted(df.MSZoning.dropna().unique()), default=[],
        key="f_zone",
    )
    bed_rng = st.slider(
        "חדרי שינה",
        int(df.BedroomAbvGr.min()),
        int(df.BedroomAbvGr.max()),
        (int(df.BedroomAbvGr.min()), int(df.BedroomAbvGr.max())),
        key="f_bed",
    )
    sel_years_sold = st.multiselect(
        "שנת מכירה", sorted(df.YrSold.unique()), default=[], key="f_yrsold"
    )
    sel_garage = st.radio(
        "חניה", ["הכל", "עם חניה", "ללא חניה"], horizontal=True, key="f_garage"
    )
    sel_fire = st.radio(
        "קמין", ["הכל", "עם קמין", "ללא קמין"], horizontal=True, key="f_fire"
    )
    sel_air = st.radio(
        "מיזוג מרכזי", ["הכל", "כן", "לא"], horizontal=True, key="f_air"
    )
    sel_cond = st.multiselect(
        "תנאי מכירה", sorted(df.SaleCondition.unique()), default=[], key="f_cond"
    )


# ---------- החלת הפילטרים ----------
def apply_filters(d: pd.DataFrame) -> pd.DataFrame:
    m = (
        d.SalePrice.between(*price_rng)
        & d.YearBuilt.between(*year_rng)
        & d.OverallQual.between(*qual_rng)
        & d.GrLivArea.between(*area_rng)
        & d.BedroomAbvGr.between(*bed_rng)
    )
    if sel_nb:
        m &= d.Neighborhood.isin(sel_nb)
    if sel_style:
        m &= d.HouseStyle.isin(sel_style)
    if sel_type:
        m &= d.BldgType.isin(sel_type)
    if sel_zone:
        m &= d.MSZoning.isin(sel_zone)
    if sel_years_sold:
        m &= d.YrSold.isin(sel_years_sold)
    if sel_cond:
        m &= d.SaleCondition.isin(sel_cond)
    if sel_garage != "הכל":
        m &= d.HasGarage == sel_garage
    if sel_fire != "הכל":
        m &= d.HasFireplace == sel_fire
    if sel_air != "הכל":
        m &= d.CentralAir == ("Y" if sel_air == "כן" else "N")
    return d[m]


fdf = apply_filters(df)

st.title('🏠 דאשבורד נדל"ן — Ames Housing')
st.caption(
    f"מוצגות **{len(fdf):,}** עסקאות מתוך **{len(df):,}** "
    f"({len(fdf) / len(df):.0%} מהנתונים)"
)

if fdf.empty:
    st.warning("אין נתונים התואמים לפילטרים שנבחרו. נסה להרחיב את הטווחים.")
    st.stop()

# ---------- KPI ----------
def delta_vs_all(val, base, money=False, pct=False):
    if pd.isna(val) or pd.isna(base) or base == 0:
        return None
    d = val - base
    if pct:
        return f"{d / base:+.1%} מול הכלל"
    return f"{d:+,.0f} מול הכלל" if money else f"{d:+,.1f} מול הכלל"


k = st.columns(3)
k2 = st.columns(3)

k[0].metric("מספר עסקאות", f"{len(fdf):,}", delta=f"{len(fdf) - len(df):+,} מול הכלל")
k[1].metric(
    "מחיר ממוצע",
    fmt_money(fdf.SalePrice.mean()),
    delta=delta_vs_all(fdf.SalePrice.mean(), df.SalePrice.mean(), pct=True),
)
k[2].metric(
    "מחיר חציוני",
    fmt_money(fdf.SalePrice.median()),
    delta=delta_vs_all(fdf.SalePrice.median(), df.SalePrice.median(), pct=True),
)
k2[0].metric(
    "מחיר למ״ר (sq ft)",
    f"${fdf.PricePerSF.mean():,.0f}",
    delta=delta_vs_all(fdf.PricePerSF.mean(), df.PricePerSF.mean(), pct=True),
)
k2[1].metric(
    "שטח מגורים ממוצע",
    f"{fdf.GrLivArea.mean():,.0f} sq ft",
    delta=delta_vs_all(fdf.GrLivArea.mean(), df.GrLivArea.mean(), pct=True),
)
k2[2].metric(
    "גיל ממוצע בעת המכירה",
    f"{fdf.HouseAge.mean():,.0f} שנים",
    delta=delta_vs_all(fdf.HouseAge.mean(), df.HouseAge.mean()),
)

with st.expander("📌 מדדים נוספים"):
    e = st.columns(4)
    e[0].metric("מחיר מקסימלי", fmt_money(fdf.SalePrice.max()))
    e[1].metric("מחיר מינימלי", fmt_money(fdf.SalePrice.min()))
    e[2].metric("סה״כ מחזור מכירות", f"${fdf.SalePrice.sum() / 1e6:,.1f}M")
    e[3].metric("איכות כללית ממוצעת", f"{fdf.OverallQual.mean():.2f}")
    e2 = st.columns(4)
    e2[0].metric("חדרי שינה (ממוצע)", f"{fdf.BedroomAbvGr.mean():.1f}")
    e2[1].metric("חדרי רחצה (ממוצע)", f"{fdf.TotalBaths.mean():.1f}")
    e2[2].metric("% עם חניה", f"{(fdf.HasGarage == 'עם חניה').mean():.0%}")
    e2[3].metric("% עם קמין", f"{(fdf.HasFireplace == 'עם קמין').mean():.0%}")

st.divider()

# ---------- טאבים של גרפים ----------
tab_dist, tab_geo, tab_feat, tab_time, tab_corr, tab_table = st.tabs(
    ["📊 התפלגות", "📍 שכונות", "🧱 מאפייני הנכס", "📈 מגמות בזמן", "🔗 מתאמים", "📋 טבלה"]
)

# --- התפלגות ---
with tab_dist:
    c1, c2 = st.columns(2)

    with c1:
        bins = st.slider("מספר עמודות בהיסטוגרמה", 10, 100, 40, key="hist_bins")
        log_x = st.checkbox("סקאלה לוגריתמית", value=False, key="hist_log")
        fig = px.histogram(
            fdf,
            x="SalePrice",
            nbins=bins,
            log_x=log_x,
            marginal="box",
            title="התפלגות מחירי מכירה",
            labels={"SalePrice": "מחיר מכירה ($)", "count": "כמות"},
            color_discrete_sequence=[SEQ[5]],
            template=PLOT_TEMPLATE,
        )
        fig.add_vline(
            x=fdf.SalePrice.median(),
            line_dash="dash",
            line_color="crimson",
            annotation_text="חציון",
        )
        st.plotly_chart(fig, width="stretch")

    with c2:
        num_col = st.selectbox(
            "משתנה מספרי להתפלגות",
            ["GrLivArea", "TotalSF", "LotArea", "PricePerSF", "HouseAge", "TotalBaths"],
            key="dist_num",
        )
        fig = px.histogram(
            fdf,
            x=num_col,
            nbins=40,
            marginal="violin",
            title=f"התפלגות — {num_col}",
            color_discrete_sequence=[SEQ[3]],
            template=PLOT_TEMPLATE,
        )
        st.plotly_chart(fig, width="stretch")

    cat_col = st.selectbox(
        "פילוח לפי קטגוריה",
        ["OverallQual", "HouseStyle", "BldgType", "MSZoning", "SaleCondition",
         "KitchenQual", "ExterQual", "Decade"],
        key="dist_cat",
    )
    c3, c4 = st.columns([2, 1])
    with c3:
        fig = px.box(
            fdf.sort_values(cat_col),
            x=cat_col,
            y="SalePrice",
            color=cat_col,
            points="outliers",
            title=f"פיזור מחירים לפי {cat_col}",
            labels={"SalePrice": "מחיר מכירה ($)"},
            color_discrete_sequence=QUAL,
            template=PLOT_TEMPLATE,
        )
        fig.update_layout(showlegend=False)
        st.plotly_chart(fig, width="stretch")
    with c4:
        counts = fdf[cat_col].value_counts().reset_index()
        counts.columns = [cat_col, "count"]
        fig = px.pie(
            counts,
            names=cat_col,
            values="count",
            hole=0.45,
            title=f"נתח מכירות לפי {cat_col}",
            color_discrete_sequence=QUAL,
            template=PLOT_TEMPLATE,
        )
        st.plotly_chart(fig, width="stretch")

# --- שכונות ---
with tab_geo:
    c1, c2 = st.columns([1, 1])
    metric_map = {
        "מחיר ממוצע": ("SalePrice", "mean"),
        "מחיר חציוני": ("SalePrice", "median"),
        "מחיר למ״ר (ממוצע)": ("PricePerSF", "mean"),
        "מספר עסקאות": ("SalePrice", "count"),
        "שטח מגורים ממוצע": ("GrLivArea", "mean"),
        "איכות ממוצעת": ("OverallQual", "mean"),
    }
    with c1:
        metric_name = st.selectbox("מדד להשוואה", list(metric_map), key="geo_metric")
    with c2:
        sort_dir = st.radio(
            "מיון", ["מהגבוה לנמוך", "מהנמוך לגבוה", "לפי שם"],
            horizontal=True, key="geo_sort",
        )

    col, agg = metric_map[metric_name]
    nb = fdf.groupby("Neighborhood")[col].agg(agg).reset_index(name="value")
    nb["count"] = fdf.groupby("Neighborhood").size().values

    if sort_dir == "מהגבוה לנמוך":
        nb = nb.sort_values("value", ascending=True)  # ascending → הגבוה למעלה בגרף אופקי
    elif sort_dir == "מהנמוך לגבוה":
        nb = nb.sort_values("value", ascending=False)
    else:
        nb = nb.sort_values("Neighborhood", ascending=False)

    fig = px.bar(
        nb,
        x="value",
        y="Neighborhood",
        orientation="h",
        color="value",
        text_auto=".2s",
        title=f"{metric_name} לפי שכונה",
        labels={"value": metric_name, "Neighborhood": "שכונה"},
        color_continuous_scale=SEQ,
        hover_data={"count": True},
        template=PLOT_TEMPLATE,
    )
    fig.update_layout(height=max(420, 22 * len(nb)), coloraxis_showscale=False)
    st.plotly_chart(fig, width="stretch")

    top_n = st.slider("מספר שכונות מובילות להצגה", 3, 25, 10, key="geo_topn")
    top_nb = (
        fdf.groupby("Neighborhood")["SalePrice"].median().nlargest(top_n).index
    )
    fig = px.violin(
        fdf[fdf.Neighborhood.isin(top_nb)],
        x="Neighborhood",
        y="SalePrice",
        color="Neighborhood",
        box=True,
        points=False,
        title=f"התפלגות מחירים — {top_n} השכונות היקרות",
        labels={"SalePrice": "מחיר מכירה ($)", "Neighborhood": "שכונה"},
        color_discrete_sequence=QUAL,
        template=PLOT_TEMPLATE,
    )
    fig.update_layout(showlegend=False)
    st.plotly_chart(fig, width="stretch")

# --- מאפייני הנכס ---
with tab_feat:
    c1, c2, c3 = st.columns(3)
    x_axis = c1.selectbox(
        "ציר X",
        ["GrLivArea", "TotalSF", "LotArea", "TotalBsmtSF", "GarageArea",
         "YearBuilt", "OverallQual", "HouseAge", "TotalBaths"],
        key="sc_x",
    )
    color_by = c2.selectbox(
        "צביעה לפי",
        ["OverallQual", "Neighborhood", "HouseStyle", "BldgType", "CentralAir",
         "HasGarage", "KitchenQual", "ללא"],
        key="sc_color",
    )
    trend = c3.selectbox("קו מגמה", ["ללא", "לינארי (ols)", "החלקה (lowess)"], key="sc_tr")

    trend_arg = {"ללא": None, "לינארי (ols)": "ols", "החלקה (lowess)": "lowess"}[trend]
    fig = px.scatter(
        fdf,
        x=x_axis,
        y="SalePrice",
        color=None if color_by == "ללא" else color_by,
        size="GrLivArea",
        size_max=16,
        opacity=0.65,
        trendline=trend_arg,
        trendline_scope="overall" if trend_arg else None,
        hover_data=["Neighborhood", "YearBuilt", "OverallQual", "GrLivArea"],
        title=f"מחיר מכירה מול {x_axis}",
        labels={"SalePrice": "מחיר מכירה ($)"},
        color_continuous_scale=SEQ,
        color_discrete_sequence=QUAL,
        template=PLOT_TEMPLATE,
    )
    fig.update_layout(height=560)
    st.plotly_chart(fig, width="stretch")

    c1, c2 = st.columns(2)
    with c1:
        q = (
            fdf.groupby("OverallQual")
            .agg(avg_price=("SalePrice", "mean"), n=("SalePrice", "size"))
            .reset_index()
        )
        fig = px.bar(
            q,
            x="OverallQual",
            y="avg_price",
            text_auto=".3s",
            color="avg_price",
            title="מחיר ממוצע לפי דירוג איכות כללית",
            labels={"OverallQual": "איכות כללית", "avg_price": "מחיר ממוצע ($)"},
            color_continuous_scale=SEQ,
            hover_data={"n": True},
            template=PLOT_TEMPLATE,
        )
        fig.update_layout(coloraxis_showscale=False)
        st.plotly_chart(fig, width="stretch")
    with c2:
        heat = (
            fdf.groupby(["BedroomAbvGr", "FullBath"])["SalePrice"]
            .mean()
            .reset_index()
            .pivot(index="BedroomAbvGr", columns="FullBath", values="SalePrice")
        )
        fig = px.imshow(
            heat,
            text_auto=".2s",
            aspect="auto",
            color_continuous_scale=SEQ,
            title="מחיר ממוצע: חדרי שינה מול חדרי רחצה",
            labels={"x": "חדרי רחצה", "y": "חדרי שינה", "color": "מחיר ממוצע"},
            template=PLOT_TEMPLATE,
        )
        st.plotly_chart(fig, width="stretch")

# --- מגמות בזמן ---
with tab_time:
    ts = (
        fdf.groupby("SaleDate")
        .agg(avg_price=("SalePrice", "mean"),
             median_price=("SalePrice", "median"),
             deals=("SalePrice", "size"))
        .reset_index()
        .sort_values("SaleDate")
    )
    show = st.multiselect(
        "סדרות להצגה",
        ["מחיר ממוצע", "מחיר חציוני"],
        default=["מחיר ממוצע", "מחיר חציוני"],
        key="ts_series",
    )
    cols = []
    if "מחיר ממוצע" in show:
        cols.append("avg_price")
    if "מחיר חציוני" in show:
        cols.append("median_price")
    if cols:
        fig = px.line(
            ts,
            x="SaleDate",
            y=cols,
            markers=True,
            title="מגמת מחירים לאורך זמן (חודשי)",
            labels={"SaleDate": "תאריך מכירה", "value": "מחיר ($)", "variable": "סדרה"},
            color_discrete_sequence=QUAL,
            template=PLOT_TEMPLATE,
        )
        st.plotly_chart(fig, width="stretch")

    c1, c2 = st.columns(2)
    with c1:
        fig = px.bar(
            ts,
            x="SaleDate",
            y="deals",
            title="נפח עסקאות לפי חודש",
            labels={"SaleDate": "תאריך", "deals": "מספר עסקאות"},
            color_discrete_sequence=[SEQ[4]],
            template=PLOT_TEMPLATE,
        )
        st.plotly_chart(fig, width="stretch")
    with c2:
        seas = (
            fdf.groupby("MoSold")
            .agg(deals=("SalePrice", "size"), avg_price=("SalePrice", "mean"))
            .reset_index()
        )
        fig = px.bar(
            seas,
            x="MoSold",
            y="deals",
            color="avg_price",
            title="עונתיות — עסקאות לפי חודש בשנה",
            labels={"MoSold": "חודש", "deals": "מספר עסקאות", "avg_price": "מחיר ממוצע"},
            color_continuous_scale=SEQ,
            template=PLOT_TEMPLATE,
        )
        fig.update_xaxes(dtick=1)
        st.plotly_chart(fig, width="stretch")

    built = (
        fdf.groupby("Decade")
        .agg(avg_price=("SalePrice", "mean"), n=("SalePrice", "size"))
        .reset_index()
        .sort_values("Decade")
    )
    fig = px.line(
        built,
        x="Decade",
        y="avg_price",
        markers=True,
        title="מחיר ממוצע לפי עשור בנייה",
        labels={"Decade": "עשור בנייה", "avg_price": "מחיר ממוצע ($)"},
        hover_data={"n": True},
        color_discrete_sequence=[SEQ[6]],
        template=PLOT_TEMPLATE,
    )
    st.plotly_chart(fig, width="stretch")

# --- מתאמים ---
with tab_corr:
    default_cols = [
        "SalePrice", "OverallQual", "GrLivArea", "TotalSF", "GarageArea",
        "GarageCars", "TotalBsmtSF", "FullBath", "YearBuilt", "LotArea",
        "TotRmsAbvGrd", "Fireplaces",
    ]
    numeric_cols = sorted(fdf.select_dtypes("number").columns.drop(["Id"], errors="ignore"))
    chosen = st.multiselect(
        "משתנים למטריצת מתאמים",
        numeric_cols,
        default=[c for c in default_cols if c in numeric_cols],
        key="corr_cols",
    )
    if len(chosen) >= 2:
        corr = fdf[chosen].corr()
        fig = px.imshow(
            corr,
            text_auto=".2f",
            aspect="auto",
            color_continuous_scale="RdBu_r",
            zmin=-1,
            zmax=1,
            title="מטריצת מתאמים (Pearson)",
            template=PLOT_TEMPLATE,
        )
        fig.update_layout(height=680)
        st.plotly_chart(fig, width="stretch")
    else:
        st.info("בחר לפחות שני משתנים.")

    st.subheader("המשתנים המשפיעים ביותר על מחיר המכירה")
    top_k = st.slider("מספר משתנים", 5, 30, 15, key="corr_topk")
    cor_price = (
        fdf.select_dtypes("number")
        .drop(columns=["Id", "SalePrice"], errors="ignore")
        .corrwith(fdf.SalePrice)
        .dropna()
        .sort_values(key=abs, ascending=False)
        .head(top_k)
        .sort_values()
        .reset_index()
    )
    cor_price.columns = ["feature", "corr"]
    fig = px.bar(
        cor_price,
        x="corr",
        y="feature",
        orientation="h",
        color="corr",
        text_auto=".2f",
        color_continuous_scale="RdBu_r",
        range_color=[-1, 1],
        labels={"corr": "מתאם עם מחיר", "feature": "משתנה"},
        title=f"{top_k} המשתנים בעלי המתאם החזק ביותר למחיר",
        template=PLOT_TEMPLATE,
    )
    fig.update_layout(height=max(400, 26 * len(cor_price)), coloraxis_showscale=False)
    st.plotly_chart(fig, width="stretch")

# --- טבלה עם מיון ---
with tab_table:
    st.subheader("טבלת נתונים — מיון וייצוא")

    preset = [
        "Id", "Neighborhood", "SalePrice", "PricePerSF", "GrLivArea", "TotalSF",
        "LotArea", "OverallQual", "OverallCond", "YearBuilt", "BedroomAbvGr",
        "TotalBaths", "GarageCars", "HouseStyle", "BldgType", "YrSold", "MoSold",
    ]
    c1, c2, c3, c4 = st.columns([3, 2, 1.2, 1])
    show_cols = c1.multiselect(
        "עמודות להצגה",
        list(fdf.columns),
        default=[c for c in preset if c in fdf.columns],
        key="tb_cols",
    )
    sort_cols = c2.multiselect(
        "מיין לפי", show_cols or list(fdf.columns), default=["SalePrice"], key="tb_sort"
    )
    order = c3.radio("סדר", ["יורד", "עולה"], horizontal=True, key="tb_order")
    # ללא key מכוון: כשמספר השורות המסוננות משתנה, הווידג'ט נבנה מחדש עם גבולות תקינים
    max_rows = int(len(fdf))
    limit = c4.number_input(
        "שורות", min_value=1, max_value=max_rows, value=min(100, max_rows), step=10
    )

    tbl = fdf[show_cols] if show_cols else fdf
    if sort_cols:
        tbl = tbl.sort_values(sort_cols, ascending=(order == "עולה"))
    tbl = tbl.head(int(limit))

    st.dataframe(
        tbl,
        width="stretch",
        height=560,
        hide_index=True,
        column_config={
            "SalePrice": st.column_config.NumberColumn("מחיר מכירה", format="$%d"),
            "PricePerSF": st.column_config.NumberColumn("מחיר ל-sqft", format="$%.0f"),
            "GrLivArea": st.column_config.NumberColumn("שטח מגורים", format="%d"),
            "LotArea": st.column_config.NumberColumn("שטח מגרש", format="%d"),
            "OverallQual": st.column_config.ProgressColumn(
                "איכות", min_value=0, max_value=10, format="%d"
            ),
        },
    )
    st.caption("💡 אפשר גם ללחוץ על כותרת עמודה בטבלה כדי למיין אותה ישירות.")

    st.download_button(
        "⬇️ הורדת הנתונים המסוננים (CSV)",
        fdf.to_csv(index=False).encode("utf-8-sig"),
        file_name="filtered_houses.csv",
        mime="text/csv",
    )

    with st.expander("סטטיסטיקה תיאורית"):
        st.dataframe(
            fdf[[c for c in show_cols if pd.api.types.is_numeric_dtype(fdf[c])]]
            .describe()
            .T,
            width="stretch",
        )
