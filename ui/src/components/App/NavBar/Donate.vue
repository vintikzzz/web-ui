<template>
    <b-nav-item :class="cl" :href="href">️<span class="heart">{{ heart }}</span><span class="title">{{ title }}</span></b-nav-item>
</template>

<style lang="scss" scoped>
.tier .heart {
  padding-right: 0.2rem;
  font-size: 0.7rem;
}
.donate a.nav-link {
  padding-left: 0rem !important;
  padding-right: 0.2rem !important;
  padding-bottom: 0rem;
  padding-top: 0rem;
}
.title {
    padding-left: 0.2rem;
}
</style>

<script>
export default {
    computed: {
        cl() {
            let cl = "donate"
            if (this.tier) {
                cl += " tier " + this.tier.toLowerCase().replace(' ', '-');
            }
            return cl;
        },
        tier() {
            let user = this.$store.state.user;
            if (!user) return null;
            if (user.role == 'NOBODY') return null;
            const words = user.role.toLowerCase().split('_');
            for (const i in words) {
                words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
            }
            return words.join(' ');
        },
        heart() {
            if (this.tier) {
                const words = this.tier.split(' ');
                const t = words.shift().toLowerCase();
                return this.$t('tier hearts.' + t);
            } else {
                return '♡️';
            }
        },
        title() {
            if (this.tier) {
                const words = this.tier.split(' ');
                return words.pop();
            }
            return this.$t('common.donate');
        },
        href() {
            return this.$store.state.sponsorURL;
        }
    }
}
</script>

